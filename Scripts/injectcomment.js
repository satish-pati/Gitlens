(function() {
    // Create and style the Comment button
    const commentCard = document.querySelector('[data-feature="comment-generator"]');
    // Create modal container for the comment result
    let modal = document.createElement("div");
    modal.id = "commentModal";
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
    modal.appendChild(commentContent);
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

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
            let response = await fetch("http://localhost:5000/generate_comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoData)
            });
            let result = await response.json();
            commentContent.innerText = result.output || "No comments generated.";
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
            chrome.tabs.sendMessage(activeTab.id, { action: "scrapeRepoDetails" }, function(response) {
                callback(response);
            });
        });
    }
    
})();