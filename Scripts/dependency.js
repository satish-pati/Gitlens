(function() {
    // Create and style the Dependency Analysis button
    let dependencyButton = document.createElement("button");
    dependencyButton.innerText = "Analyze Dependencies";
    dependencyButton.style.position = "fixed";
    dependencyButton.style.bottom = "140px";
    dependencyButton.style.right = "20px";
    dependencyButton.style.padding = "10px 15px";
    dependencyButton.style.zIndex = "10000";
    dependencyButton.style.backgroundColor = "#ff9800";
    dependencyButton.style.color = "#fff";
    dependencyButton.style.border = "none";
    dependencyButton.style.borderRadius = "5px";
    dependencyButton.style.cursor = "pointer";
    document.body.appendChild(dependencyButton);

    // Create modal container for results
    let modal = document.createElement("div");
    modal.id = "dependencyModal";
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

    // Create close button
    let closeButton = document.createElement("span");
    closeButton.innerText = "✖";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "20px";
    modal.appendChild(closeButton);

    // Create content container inside modal
    let dependencyContent = document.createElement("div");
    dependencyContent.id = "dependencyContent";
    modal.appendChild(dependencyContent);
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // When the Dependency Analysis button is clicked
    dependencyButton.addEventListener("click", async () => {
        dependencyContent.innerText = "Analyzing dependencies...";
        modal.style.display = "block";

        // Extract repository details
        let repoData = scrapeRepoDetails();
        if (repoData.error) {
            dependencyContent.innerText = repoData.error;
            return;
        }
        
        console.log("Extracted Repo Data:", repoData);
        
        // Send extracted data to backend
        try {
            let response = await fetch("http://localhost:5000/analyze_dependencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoData)
            });
            let result = await response.json();
            dependencyContent.innerText = JSON.stringify(result.dependencies, null, 2);
        } catch (error) {
            dependencyContent.innerText = "Error contacting backend: " + error.message;
        }
    });

    // Function to extract repository details
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
})();


function getGitHubRepoDetailsFromTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: "scrapeRepoDetails" }, function(response) {
            callback(response);
        });
    });
}
