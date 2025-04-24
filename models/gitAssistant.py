from langchain_astradb import AstraDBVectorStore
from flask import Flask, request, jsonify,session,redirect
from flask_cors import CORS
from langchain.schema import AIMessage
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.documents import Document
from flask import make_response
from langchain_community.vectorstores import Pinecone
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

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
GROQ_API_KEY = "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"
ASTRA_DB_API_ENDPOINT ="https://c3a41914-60ab-4d12-86e0-94529d26efe6-us-east-2.apps.astra.datastax.com"
ASTRA_DB_APPLICATION_TOKEN ="AstraCS:BRtrSNZAeQZDsHCcPEYAGdWX:27b10125049889c502c4dd000fff56fed12a0bc8ad3b7c39d72405e6b4bc2811"
ASTRA_DB_KEYSPACE = "default_keyspace"
HF_TOKEN = "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"


store = {}

def get_session_history(session_id: str, max_history_length=5):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    else:
        store[session_id].messages = store[session_id].messages[-max_history_length:]
    return store[session_id]
# --- Data ingestion function ---
def data_ingestion(page_conten):
    try:
     splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len
    )
     chunks = splitter.split_text(page_conten)

    # 2) Wrap each chunk in a LangChain Document
     docs = [Document(page_content=chunk) for chunk in chunks]

    # 3) Build a fresh FAISS vectorstore *in memory*
     vstore = FAISS.from_documents(docs, embeddings)
     print(f"Inserted Document IDs: {vstore}")  # Debugging line
     return vstore
    except Exception as e:
        print(f"Error during data ingestion: {e}")
        raise

    return vstore

# --- Create chain ---
def generate_chain_from_vectorstore(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    retriever_prompt = (
        "Given a chat history and the latest user question which might reference context in the chat history, "
        "formulate a standalone question. Do NOT answer the question, just reformulate it if needed."
    )

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", retriever_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])

    history_aware_retriever = create_history_aware_retriever(model, retriever, contextualize_q_prompt)

    MEDICAL_BOT_TEMPLATE = """
    You are a chatbot with knowledge extracted from the page content. 
    Use this context to answer the user's question accurately.

    CONTEXT:
    {context}

    QUESTION: {input}

    YOUR ANSWER:
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", MEDICAL_BOT_TEMPLATE),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])

    question_answer_chain = create_stuff_documents_chain(model, qa_prompt)
    chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    return RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer"
    )

# --- Endpoint ---
@app.route("/ask_question", methods=["POST"])
def ask_question():
    try:
        data = request.get_json()
        question = data.get("question", "")
        page_content = data.get("content", "")
        session_id = data.get("session_id", "default")
        print(f"Received question: {question}")
        print(f"Page content: {page_content}")

        if not question:
            return jsonify({"error": "Missing question"}), 400
        if not page_content:
            return jsonify({"error": "Missing page content"}), 400

        # Ingest new page content
        vectorstore = data_ingestion(page_content)
        print(f"Vectorstore created: {vectorstore}")
        # Build the chain
        chain = generate_chain_from_vectorstore(vectorstore)

        # Invoke
        response = chain.invoke(
            {"input": question},
            config={"configurable": {"session_id": session_id}}
        )["answer"]
        print(response)
        return jsonify({"answer": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


