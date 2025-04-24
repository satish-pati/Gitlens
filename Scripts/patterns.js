(function() {
    // Create and style the Comment button
    const commentCard = document.querySelector('[data-feature="pattern-generator"]');
    // Create modal container for the comment result
    let modal = document.createElement("div");
    modal.id = "analysisModal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.width = "100vw";
    modal.style.maxWidth = "600px";
    modal.style.backgroundColor = "#0d1117";
    modal.style.border = "1px solid #30363d";
    modal.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.5)";
    modal.style.padding = "20px";
    modal.style.zIndex = "10001";
    modal.style.display = "none";
//document.body.style.overflow = "hidden";
    modal.style.overflowY = "auto";
    modal.style.maxHeight = "100%";
    modal.style.color = "#c9d1d9";
    // Create close button for modal
    let closeButton = document.createElement("span");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "20px";
    modal.appendChild(closeButton);

    // Create content container inside modal for the comment text
    let commentContent = document.createElement("div");
    commentContent.id = "commentContent";
    commentContent.style.fontSize = "1.2rem";
commentContent.style.lineHeight = "1.6";
commentContent.style.fontWeight = "500";
    modal.appendChild(commentContent);
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });
    let pushButton = document.createElement("button");
pushButton.innerText = "🚀 Push to Repo";
pushButton.style = `margin-top: 12px; background-color: #238636; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer;`;
modal.appendChild(pushButton);


    // When the Comment button is clicked
    commentCard.addEventListener("click", async () => {
        commentContent.innerText = "Generating inline comments...";
        modal.style.display = "block";

        // Extract repository details from the page
        getGitHubRepoDetailsFromTab(async (repoData) => {
            if (repoData.error) {
                commentContent.innerText = repoData.error;
                return;
            }
    
        
        console.log("Extracted Repo Data:", repoData);    
        // Send extracted data to backend for comment generation
        try {
            let response = await fetch("http://localhost:5000//code_quality_insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoData)
            });
            let result = await response.json();
            commentContent.innerHTML = result.analysis || "No comments generated.";
        } catch (error) {
            commentContent.innerText = "Error contacting backend: " + error.message;
        }
    });
    });

    // Function to extract repository details
    function scrapeRepoDetails() {
        let repoData = {};

        if (!document.location.hostname.includes("github.com")) {
            console.log(document.location.hostname);
            return { error: "This does not appear to be a GitHub repository page." };
        }

        let repoNameElem = document.querySelector('strong[itemprop="name"] a');
        repoData.name = repoNameElem ? repoNameElem.innerText.trim() : "Unknown Repo";
        let descElem = document.querySelector('meta[name="description"]');
        repoData.description = descElem ? descElem.content.trim() : "No description available.";
        repoData.fullText = document.body.innerText;
        return repoData;
    }
    function getGitHubRepoDetailsFromTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "fetchEditorText" }, function(response) {
                callback(response);
            });
        });
    }
    
})();
function getGitHubRepoDetailsFromTab2(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "autocomments" }, function(response) {
            callback(response);
        });
    });
}