import os
import logging
from flask import Flask, request, jsonify,session,redirect
from flask_cors import CORS
from langchain.schema import AIMessage
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from deep_translator import GoogleTranslator
import re
import ast
import requests
from bs4 import BeautifulSoup
import time
from flask import make_response
import base64
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
import os

app = Flask(__name__)
#CORS(app)
#CORS(app, resources={r"/*": {"origins": "*"}})  # Ensure all routes allow CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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
@app.route('/generate_commit_message', methods=['POST'])
def generate_commit_message():
    data = request.get_json()
    if not data or "diff" not in data:
        return jsonify({"error": "No diff data provided."}), 400

    git_diff = data["diff"]

    prompt = f"""
You are an expert Git assistant.

Based on the following Git diff, write a clear, concise, and conventional commit message. 
Structure the message in imperative tone (e.g., "Fix bug", "Add feature"), and include a short subject and optionally a body if needed.

Git Diff:
{git_diff}

css
Copy
Edit
Return ONLY the commit message, no explanations or formatting.
"""

    try:
        response = model.invoke(prompt)
        if isinstance(response, AIMessage):
            response = response.content
        return jsonify({"commit_message": response.strip()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
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
Return the analysis in HTML format where:
- Main section headings use <h2> tags with bold styling.
- Subheadings use <h3> tags.
- Key points are wrapped in <strong> tags.
 - Bullet points should appear on **separate lines** using `<ul><li>` format.
  - Ensure **proper line breaks** and **visual spacing** between sections.
  - Use **paragraphs `<p>`** to improve readability.
  - Do not compress all bullet points into one paragraph; instead, place each point clearly and separately.
  - Make the output **clean and visually appealing** for display in a modal or rich text viewer.
    """


    try:
        summary = model.invoke(prompt)
        if isinstance(summary, AIMessage):
            summary = summary.content
        return jsonify({"summary": summary}), 200
    except Exception as e:
        logging.error(f"Error generating summary: {e}")
        return jsonify({"error": f"Error generating summary: {str(e)}"}), 500

@app.route('/generate_comments', methods=['POST'])
def generate_comments():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400
    #repo_name = data.get('name', 'Unknown Repository')
    #repo_description = data.get('description', 'No description available.')
    full_text = data
    print(full_text)
    prompt = f"""
    Code:
    {full_text}
    Add concise, one-line comments directly above each function definition explaining its purpose. Do not remove or alter any code. Do not add any extra commentary or headers. Only insert  inline comments above functions. Output all the code.
    """
    try:
        summary = model.invoke(prompt)
        return jsonify({"output": summary.content}), 200
    except Exception as e:
        return jsonify({"error": f"Error generating comments: {str(e)}"}), 500

@app.route('/detect_ai_code', methods=['POST'])
def detect_ai_code():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    
    full_text = data
    print(full_text)
    prompt = f"""

    Full Page Content:
    {full_text}

    Analyze the provided code and determine what percentage is likely AI-generated vs. human-written code.
    Provide an estimate in the format: AI Code: X% | Human Code: Y%
    """

    try:
        response = model.invoke(prompt)
        result = response.content
        ai_percentage, human_percentage = extract_percentages(result)

        return jsonify({
            "ai_percentage": ai_percentage,
            "human_percentage": human_percentage
        }), 200
    except Exception as e:
        logging.error(f"Error detecting AI code: {e}")
        return jsonify({"error": f"Error detecting AI code: {str(e)}"}), 500
def translate_text(text, target_lang):
    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        logging.error(f"Error during translation: {e}")
        return text  # Return original text on error

def extract_percentages(text):
    import re
    ai_match = re.search(r'AI Code:\s*(\d+)%', text)
    human_match = re.search(r'Human Code:\s*(\d+)%', text)
    
    ai_percentage = int(ai_match.group(1)) if ai_match else 50
    human_percentage = int(human_match.group(1)) if human_match else 50
    return ai_percentage, human_percentage
'''@app.route('/analyze_dependencies', methods=['POST', 'OPTIONS'])
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
    - A list of function names and the functions they call.
    - A list of class names and their dependencies (parent classes, used functions).

    Code:
    ```python
    {full_text}
    ```

    Return the output as a structured JSON object, without any extra explanations:

    {{
        "functions": {{
            "function_name_1": ["called_function_1", "called_function_2"],
            "function_name_2": ["called_function_3"]
        }},
        "classes": {{
            "ClassName1": ["ParentClass1", "used_function_1"],
            "ClassName2": []
        }}
    }}
    """

    try:
        response = model.invoke(prompt)
        result = response.content

        return jsonify({"dependencies": result}), 200
    except Exception as e:
        logging.error(f"Error analyzing dependencies: {e}")
        return jsonify({"error": f"Error analyzing dependencies: {str(e)}"}), 500

'''
@app.route('/analyze_dependencies', methods=['POST', 'OPTIONS'])
def analyze_dependencies():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight successful"}), 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400
    full_text = data
    print(full_text)

    # Construct the refined prompt for LLM
    prompt = f"""
    Analyze the given  code and extract:
    - A list of function names along with the functions they call.
    - A list of class names along with their dependencies (parent classes, used functions).

    Code:
   
    {full_text}
   

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
def perform_static_analysis(code_text):
    """
    Perform static analysis using Python's AST to extract functions and classes.
    Returns a summary of the detected functions and classes.
    """
    try:
        tree = ast.parse(code_text)
    except Exception as e:
        return "Error parsing code for static analysis: " + str(e)
    
    functions = []
    classes = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append(node.name)
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
    
    analysis = (
        f"Functions defined: {', '.join(functions) if functions else 'None'}. "
        f"Classes defined: {', '.join(classes) if classes else 'None'}."
    )
    return analysis
@app.route('/generate_pr_details', methods=['POST'])
def generate_pr_details():
    """
    Expects JSON:
    {
      "diff": "...full diff string..."
    }
    Returns:
    {
      "title": "AI-generated PR title",
      "description": "AI-generated PR description"
    }
    """
    data = request.get_json()
    diff = data.get('diff', '')

    if not diff:
        return jsonify({"error": "No diff provided"}), 400

    # Use your language model to generate title + description
    prompt = f"""
You're an assistant that summarizes GitHub Pull Request diffs.

Diff:
{diff}

Analyze this diff and generate a meaningful:
1. PR Title — very short, clear, concise.
2. PR Description — structured, markdown-friendly, and informative.

Format:
---
Title: <one-line summary>
Description:
<bulleted or paragraph markdown-friendly summary>
---
Return only the title and description clearly labeled.
    """

    try:
        result = model.invoke(prompt)
        if isinstance(result, AIMessage):
            result = result.content

        # Basic parsing from LLM output
        title = ""
        description = ""

        lines = result.splitlines()
        for i, line in enumerate(lines):
            if line.lower().startswith("title:"):
                title = line.split(":", 1)[1].strip()
            if line.lower().startswith("description:"):
                description = "\n".join(lines[i + 1:]).strip()
                break

        if not title:
            title = "Update based on recent changes"
        if not description:
            description = "This PR includes changes based on the recent code diff."

        return jsonify({
            "title": title,
            "description": description
        })

    except Exception as e:
        logging.error(f"🔥 Error in generate_pr_details: {e}")
        return jsonify({"error": "Failed to generate PR summary"}), 500

@app.route("/analyze_code", methods=["POST"])
def analyze_code():
    """
    Expects JSON with:
      - code: The source code to analyze
      - language: (Optional) target language code (default 'en')
    Sends code directly to the LLM to generate a full analysis and explanation.
    """
    data = request.get_json()
    if not data or "code" not in data:
        return jsonify({"error": "No code provided."}), 400

    code_text = data["code"]
    print("Code:", code_text)
    selected_lang = data.get("language", "en")

    prompt = f"""
You are an intelligent  code analysis assistant.

Your task is to analyze the following source code (in any programming language), and generate a structured,summary of the whole code.

### Instructions:
- Identify and list all **functions**(all not only explict functions) and **classes**, along with their **purpose** and **interactions**.
- Generate the ** Summary and Functionality** of the program.
- Highlight how the components work together.
- If applicable, explain control flow, key logic, and data structures used.
- Finally , provide a **summary** of the code's purpose and any notable features.

### Output Format (in HTML):
- Use `<h2>` for major sections and `<h3>` for subsections.
- Use `<ul><li>` for bullet points (place each bullet on a separate line).
- Use `<strong>` tags for highlighting important terms.
- Wrap paragraphs with `<p>`, and add line breaks for clean spacing.
- Keep it clean, readable, and visually suitable for a web modal.

### Code:
{code_text}

    """
    try:
        summary = model.invoke(prompt)
        if isinstance(summary, AIMessage):
            summary = summary.content

        if selected_lang != "en":
            summary = translate_text(summary, target_lang=selected_lang)
        return jsonify({"summary": summary}), 200
    except Exception as e:
        logging.error(f"Error generating code analysis summary: {e}")
        return jsonify({"error": f"Error generating code analysis summary: {str(e)}"}), 500

def clean_pr_number(raw_number):
    match = re.search(r'\d+', raw_number)  # Extract only digits
    return match.group() if match else raw_number  # Return cleaned number
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
    print("Repo URL:", repo_url)
    print("PR Number:", pr_number)
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
# Secret key for session management
app.secret_key = "a93b1e43f813b6bb1e23365d5ecb9024f9a58fd762fc901ec98fc45dfb57d01e"

# GitHub OAuth Config
GITHUB_CLIENT_ID = "Ov23liGeRRKhV7YK02vO"
GITHUB_CLIENT_SECRET = "ef019357cbfbcdbb056d8dda63d98132df08726e"
REDIRECT_URI = "http://localhost:5000/callback"
@app.route("/login")
def login():
    github_oauth_url = (
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=repo"
    )
    return redirect(github_oauth_url)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "❌ No code provided."

    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
    )

    token_json = token_response.json()
    access_token = token_json.get("access_token")
    if not access_token:
        return jsonify({"error": "Failed to get access token."}), 400

    session["github_token"] = access_token
    return redirect("/token_success")

@app.route("/token_success")
def token_success():
    return "✅ Token stored in session. You may now push to GitHub from extension."

@app.route("/get_token")
def get_token():
    token = session.get("github_token")
    if not token:
        return jsonify({"error": "Token not found in session."}), 403
    return jsonify({"token": token})
@app.route('/push_to_repo', methods=['POST'])
def push_to_repo():
    data = request.get_json()
    print("📥 Incoming Data:", data)  # DEBUG

    required = ['owner', 'repo', 'branch', 'file_path', 'new_content']
    token = session.get("github_token")
    owner = data["owner"]
    repo = data["repo"]
    branch = data["branch"]
    path = data["file_path"]
    new_content = data["new_content"]
    #token = data["token"]
    if not token:
        return jsonify({"error": "GitHub token not found. Please login again."}), 401

    print(f"🔍 Fetching SHA for: {owner}/{repo}/{path}@{branch}")
    print(token)
    print(new_content)
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    # STEP 1: Get file SHA
    get_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    get_resp = requests.get(get_url, headers=headers)
    print("📡 GET File SHA Response:", get_resp.status_code, get_resp.text)

    if get_resp.status_code != 200:
        return jsonify({"error": f"Failed to fetch file: {get_resp.json().get('message')}"}), 404

    sha = get_resp.json()["sha"]
    print("✅ Fetched SHA:", sha)

    # STEP 2: Push new content
    put_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    payload = {
        "message": "🤖 Updated with inline comments",
        "content": base64.b64encode(new_content.encode()).decode(),
        "branch": branch,
        "sha": sha
    }

    print("📤 Sending PUT to update file...")
    put_resp = requests.put(put_url, headers=headers, json=payload)
    print("📡 PUT Response:", put_resp.status_code, put_resp.text)

    if put_resp.status_code in [200, 201]:
        print("✅ Successfully updated the file.")
        return jsonify({"status": "✅ File updated successfully!"}), 200
    else:
        print("❌ Failed to update file:", put_resp.json())
        return jsonify({"error": f"Update failed: {put_resp.json()}"}), 500
@app.route('/code_quality_insights', methods=['POST'])
def code_quality_insights():
    """
    Analyze provided code to detect bad practices, anti-patterns, and offer improvement suggestions.
    POST JSON: { "code": "<source code>" }
    Returns HTML: Detailed insights rendered in HTML format.
    """
    data = request.get_json()
    if not data or 'code' not in data:
        return jsonify({"error": "No code provided."}), 400

    code_text = data
    # Construct prompt for AI analysis
    prompt = f"""
You are an expert code quality assistant.
Given the following source code, identify any bad practices, anti-patterns, and suggest concrete improvements:

```{code_text}```

Provide a structured list of issues and recommendations.
Return the insights in valid HTML format, using tags like <ul>, <li>, <strong>, <h2>, etc.
"""

    try:
        # Invoke the language model
        response = model.invoke(prompt)
        if isinstance(response, AIMessage):
            analysis_html = response.content.strip()
        else:
            analysis_html = str(response).strip()

        print(analysis_html)
        return jsonify({"analysis": analysis_html}) 

    except Exception as e:
        logging.error(f"Error in /code_quality_insights: {e}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
