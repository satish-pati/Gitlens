(function() {
    
   let detectAIButton =  document.querySelector('[data-feature="ai-detection"]');
    
    let modal = document.createElement("div");
    modal.id = "aiModal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.width = "80%";
    modal.style.maxWidth = "600px";
    modal.style.backgroundColor = "#fff";
    modal.style.border = "1px solid #ccc";
    modal.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    modal.style.padding = "20px";
    modal.style.zIndex = "10001";
    modal.style.display = "none";
    modal.style.overflowY = "auto";
    modal.style.maxHeight = "80%";
    
    // Close button
    let closeButton = document.createElement("span");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "20px";
    modal.appendChild(closeButton);

    let aiResultContent = document.createElement("div");
    aiResultContent.id = "aiResultContent";
    modal.appendChild(aiResultContent);
    document.body.appendChild(modal);
    
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    detectAIButton.addEventListener("click", async () => {
        aiResultContent.innerText = "Analyzing code for AI-generated content...";
        modal.style.display = "block";

getGitHubRepoDetailsFromTab(async (repoData) => {
    if (repoData.error) {
        commentContent.innerText = data.error;
        return;
    }
        try {
            let response = await fetch("http://localhost:5000/detect_ai_code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoData)
            });
            let result = await response.json();
            aiResultContent.innerText = `AI Code: ${result.ai_percentage}% | Human Code: ${result.human_percentage}%`;
        } catch (error) {
            aiResultContent.innerText = "Error contacting backend: " + error.message;
        }
    });

    function scrapeRepoDetails() {
        let repoData = {};
        if (!document.location.hostname.includes("github.com")) {
            return { error: "This does not appear to be a GitHub repository page." };
        }
        let repoNameElem = document.querySelector('strong[itemprop="name"] a');
        repoData.name = repoNameElem ? repoNameElem.innerText.trim() : "Unknown Repo";
        let descElem = document.querySelector('meta[name="description"]');
        repoData.description = descElem ? descElem.content.trim() : "No description available.";
        repoData.fullText = document.body.innerText;
        return repoData;
    }
    });
})();
function getGitHubRepoDetailsFromTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "aihuman" }, function(response) {
            callback(response);
        });
    });
}
