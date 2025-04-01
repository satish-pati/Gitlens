import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.schema import AIMessage
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

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

if __name__ == '__main__':
    app.run(debug=True)
