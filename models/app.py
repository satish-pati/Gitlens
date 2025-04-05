import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.schema import AIMessage
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
import requests
from bs4 import BeautifulSoup
from github import Github
import re
import time
app = Flask(__name__)
CORS(app)

# Configuration
app.config['VECTORSTORE'] = './vector_index'
os.makedirs(app.config['VECTORSTORE'], exist_ok=True)

# Initialize embeddings and model
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")
model = ChatGroq(
    groq_api_key="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", 
    model="llama-3.3-70b-versatile", 
    temperature=0.5
)

@app.route('/')
def index():
    return "GitLens Repository Summarization Service is running."

@app.route('/generate_summary', methods=['POST'])
def generate_summary():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    repo_name = data.get('name', 'Unknown Repository')
    repo_description = data.get('description', 'No description available.')
    full_text = data.get('fullText', '')

    print("\n✅ Received Data from Frontend:")
    print(f"Repo Name: {repo_name}")
    print(f"Description: {repo_description}")
    print(f"Full Page Text (first 500 chars):\n{full_text[:500]}...\n")

    # Construct the prompt with all extracted text
    prompt = f"""
Repository Name: {repo_name}
Description: {repo_description}

Full Page Content:
{full_text}

Based on the above details, generate a detailed and accurate summary of the repository's purpose, structure, key functionalities, dependencies, and potential use cases.
"""

    try:
        summary = model.invoke(prompt)
        if isinstance(summary, AIMessage):
            summary = summary.content
        return jsonify({"summary": summary}), 200
    except Exception as e:
        logging.error(f"Error generating summary: {e}")
        return jsonify({"error": f"Error generating summary: {str(e)}"}), 500
@app.route('/analyze_dependencies', methods=['POST', 'OPTIONS'])
def analyze_dependencies():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight successful"}), 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    repo_name = data.get('name', 'Unknown Repository')
    repo_description = data.get('description', 'No description available.')
    full_text = data.get('fullText', '')

    print("\n✅ Received Data from Frontend for Dependency Analysis:")
    print(f"Repo Name: {repo_name}")
    print(f"Description: {repo_description}")

    # Construct the refined prompt for LLM
    prompt = f"""
    Analyze the given Python code and extract:
    - A list of function names along with the functions they call.
    - A list of class names along with their dependencies (parent classes, used functions).

    Code:
    ```python
    {full_text}
    ```

    Present the results **clearly** in this format:

    ----
    **Functions and Their Dependencies**  
    function_name_1 → called_function_1, called_function_2  
    function_name_2 → called_function_3  

    ----
    **Classes and Their Dependencies**  
    ClassName1 (inherits: ParentClass1) → uses: used_function_1  
    ClassName2 (inherits: None) → uses: None  
    ----
    """
    try:
        response = model.invoke(prompt)
        result = response.content

        return jsonify({"dependencies": result}), 200
    except Exception as e:
        logging.error(f"Error analyzing dependencies: {e}")
        return jsonify({"error": f"Error analyzing dependencies: {str(e)}"}), 500


# Return cleaned number
def clean_pr_number(raw_number):
    match = re.search(r'\d+', raw_number) 
    return match.group() if match else raw_number  
# Gets the PR data using Scraping 
def get_pr_data(repo_url, max_prs=5):
    if not repo_url.endswith("/pulls"):
        repo_url += "/pulls"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(repo_url, headers=headers, timeout=10)
        if response.status_code != 200:
            print("Failed to fetch PRs:", response.status_code)
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        pr_rows = soup.select("div.js-issue-row")[:max_prs]

        if not pr_rows:
            print("No PRs found on the page. Check the repository URL.")
            return None

        pr_data_list = []
        for pr in pr_rows:
            title_elem = pr.select_one("a.Link--primary")
            author_elem = pr.select_one("a.Link--muted")
            pr_number_elem = pr.select_one("span.opened-by")  

            if not title_elem or not author_elem or not pr_number_elem:
                continue  

            title = title_elem.text.strip()
            author = author_elem.text.strip()
            pr_number = pr_number_elem.text.strip().split("#")[-1]  # Extract PR number
            pr_link = "https://github.com" + title_elem["href"]
            state = "Open" if "open" in pr.attrs.get("aria-label", "").lower() else "Closed"

            print(f"Fetching PR Details from: {pr_link}")
            files_changed_tab = pr_link + "/files"
            files_response = requests.get(files_changed_tab, headers=headers, timeout=10)
            if files_response.status_code != 200:
                continue

            files_soup = BeautifulSoup(files_response.text, "html.parser")

            file_changes = []
            total_changes = 0

            for file_div in files_soup.select(".file"):
                file_name = file_div.select_one(".file-info a").text.strip() if file_div.select_one(".file-info a") else "Unknown"
                added_lines, removed_lines = [], []

                for line in file_div.select(".blob-code"):
                    if "blob-code-addition" in line["class"]:
                        added_lines.append(line.get_text(strip=True))
                    elif "blob-code-deletion" in line["class"]:
                        removed_lines.append(line.get_text(strip=True))

                total_changes += len(added_lines) + len(removed_lines)  # Count changes

                file_changes.append({
                    "File": file_name,
                    "Added Lines": added_lines,
                    "Removed Lines": removed_lines
                })

            pr_response = requests.get(pr_link, headers=headers, timeout=10)
            if pr_response.status_code != 200:
                continue

            pr_soup = BeautifulSoup(pr_response.text, "html.parser")
             status_elem = pr_soup.select_one(".State")
            if status_elem:
                status_class=status_elem.get("class", [])
                print("Status Class:", status_class)
                if "State--closed" in status_class:
                    merge_status = "Closed" 
                elif "State--open" in status_class:
                    merge_status = "Open"   
                else:
                    merge_status = "Unknown"

            pr_data_list.append({
                "Number": clean_pr_number(pr_number),  
                "Title": title,
                "Author": author,
                "State": merge_status,
                "Created At": pr.select_one("relative-time").text.strip(),
                "Total Changes": total_changes,
                "Files Modified": file_changes
            })
            time.sleep(0.0001)
        return pr_data_list

    except requests.exceptions.RequestException as e:
        print("Error fetching PRs:", str(e))
        return None
#Route to get the PR data 
@app.route("/get_latest_pr_data", methods=["GET"])
def get_latest_pr_data_route():
    repo_url = request.args.get("repo_url")
    max_prs = request.args.get("max_prs", default=5, type=int)

    if not repo_url:
        return jsonify({"error": "Missing repo_url parameter"}), 400

    pr_data = get_pr_data(repo_url, max_prs)
    
    if pr_data is None:
        print("❌ Failed to fetch PR data")
        return jsonify({"error": "Failed to fetch PR data"}), 500

    print("✅ PR Data:", pr_data)
    return jsonify(pr_data)
#Route to generate PR analysis 
@app.route("/pr_analysis", methods=["POST"])
def pr_analysis():
    print("Received request for PR analysis")
    data = request.get_json()
    #if not data:
     #   return jsonify({"error": "No data provided."}), 400
    
    repo_url = data.get("repo_url")
    pr_number = data.get("pr_number")
    
    if not repo_url or not pr_number:
        return jsonify({"error": "Missing repo_url or pr_number"}), 400
    
    pr_data = get_pr_data(repo_url, 5)  
    pr_info = next((pr for pr in pr_data if pr.get("Number") == pr_number),None)
    print("Selected PR Info:", pr_info)
    if not pr_info:
        print("Error: PR not found")
        return jsonify({"error": "PR not found"}), 404
    
    prompt = f"""
    Pull Request Analysis:
    Title: {pr_info['Title']}
    Author: {pr_info['Author']}
    Created At: {pr_info['Created At']}
    Files Modified:{pr_info['Files Modified']}
    Total Changes: {pr_info['Total Changes']}
    Merge Status: {pr_info['State']}

    
    Analyze these changes:
    - How do they affect the functionality, structure, and performance?
    - Highlight improvements, potential issues, and security concerns.
    - Suggest best practices and optimizations.
    give the analysis in HTML Format  . 
    """
    summary = model.invoke(prompt)
    if isinstance(summary, AIMessage):
            summary = summary.content
    print("PR Analysis Summary:", summary)
    return jsonify({"summary": summary}), 200
if __name__ == '__main__':
    app.run(debug=True)
