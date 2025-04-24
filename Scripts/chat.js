function waitForBody(callback) {
  if (document.body) {
    callback();
  } else {
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

waitForBody(() => {
  const style = document.createElement("style");
  style.textContent = `
    #chat-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99998;
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 12px 18px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
    }

    #chat-container {
      font-family: sans-serif;
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 450px;
      height: 600px;
      background-color: #1a1a1a;
      color: white;
      display: none;
      flex-direction: column;
      z-index: 99999;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    #chat-header {
      background-color: #111827;
      padding: 10px;
      font-weight: bold;
      font-size: 20px;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    .chat-msg {
      margin-bottom: 10px;
      max-width: 80%;
      word-wrap: break-word;
      padding: 10px;
      border-radius: 10px;
      font-size: 14px;
    }
    .chat-msg.user {
      background-color: #2563eb;
      align-self: flex-end;
      text-align: right;
    }
    .chat-msg.bot {
      background-color: #374151;
      align-self: flex-start;
    }
    #chat-input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid #333;
      background-color: #111827;
    }
    #chat-input {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background-color: #374151;
      color: white;
    }
    #send-btn, #mic-btn {
      margin-left: 8px;
      padding: 10px;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
    }
    #send-btn {
      background-color: #2563eb;
    }
    #mic-btn {
      background-color: #4b5563;
    }
    #loading {
      text-align: center;
      color: #aaa;
      font-size: 12px;
      padding: 10px;
    }
  `;
  document.head.appendChild(style);

  // Add toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "chat-toggle-btn";
  toggleBtn.innerText = "Chat";
  document.body.appendChild(toggleBtn);

  // Chat container (hidden by default)
  const container = document.createElement("div");
  container.id = "chat-container";
  container.innerHTML = `
    <div id="chat-header">
      GitHub Page Assistant
      <button id="close-btn" style="background:none; border:none; color:white; font-size:18px; cursor:pointer;">✖</button>
    </div>
    <div id="chat-messages"></div>
    <div id="loading" style="display: none;">Loading...</div>
    <div id="chat-input-area">
      <input type="text" id="chat-input" placeholder="Type your message..." />
      <button id="send-btn">➤</button>
      <button id="mic-btn">🎤</button>
    </div>
  `;
  document.body.appendChild(container);

  // Show/hide chat on toggle
  toggleBtn.onclick = () => {
    container.style.display = container.style.display === "none" ? "flex" : "none";
  };

  // Close button inside chat
  const closeBtn = container.querySelector("#close-btn");
  closeBtn.onclick = () => {
    container.style.display = "none";
  };

  const backendURL = "http://127.0.0.1:5000/ask_question";
  const input = container.querySelector("#chat-input");
  const sendBtn = container.querySelector("#send-btn");
  const micBtn = container.querySelector("#mic-btn");
  const messagesBox = container.querySelector("#chat-messages");
  const loading = container.querySelector("#loading");

  function getPageContent() {
    const editorElement = document.getElementById("read-only-cursor-text-area");
    return editorElement?.innerText || editorElement?.textContent || "";
  }

  function addMessage(text, sender = "user") {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;
    msg.innerText = text;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function sendMessage() {
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, "user");
    input.value = "";
    loading.style.display = "block";

    const pageContent = getPageContent();
    try {
      const response = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          content: pageContent,
          session_id: "github_chat"
        }),
      });
      const data = await response.json();
      addMessage(data.answer || data.error || "No response", "bot");
    } catch (err) {
      addMessage("Error: " + err.message, "bot");
    } finally {
      loading.style.display = "none";
    }
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  micBtn.onclick = () => {
    addMessage("🎤 Voice input is not supported in this demo yet", "bot");
  };
});
