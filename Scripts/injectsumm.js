(function() {
    // Create and style the Summary button
    let summaryButton = document.createElement("button");
    summaryButton.innerText = "Summary";
    summaryButton.style.position = "fixed";
    summaryButton.style.bottom = "20px";
    summaryButton.style.right = "20px";
    summaryButton.style.padding = "10px 15px";
    summaryButton.style.zIndex = "10000";
    summaryButton.style.backgroundColor = "#0366d6";
    summaryButton.style.color = "#fff";
    summaryButton.style.border = "none";
    summaryButton.style.borderRadius = "5px";
    summaryButton.style.cursor = "pointer";
    document.body.appendChild(summaryButton);
  
    // Create modal container for the summary result
    let modal = document.createElement("div");
    modal.id = "summaryModal";
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
  
    // Create content container inside modal for the summary text
    let summaryContent = document.createElement("div");
    summaryContent.id = "summaryContent";
    modal.appendChild(summaryContent);
    
    document.body.appendChild(modal);
  
    // Close modal when clicking the close button
    closeButton.addEventListener("click", function() {
      modal.style.display = "none";
    });
  
    // When the Summary button is clicked
    summaryButton.addEventListener("click", async () => {
      summaryContent.innerText = "Generating detailed summary...";
      modal.style.display = "block";
  
      // Extract repository details from the page
      let repoData = scrapeRepoDetails();
      if (repoData.error) {
        summaryContent.innerText = repoData.error;
        return;
      }
      
      console.log("Extracted Repo Data:", repoData);
      
      // Send extracted data to your backend endpoint
      try {
        let response = await fetch("http://localhost:5000/generate_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(repoData)
        });
        let result = await response.json();
        summaryContent.innerText = result.summary;
      } catch (error) {
        summaryContent.innerText = "Error contacting backend: " + error.message;
      }
    });
  
    // This function extracts all visible text from the page's body, plus basic repo info
    function scrapeRepoDetails() {
      let repoData = {};
  
      if (!document.location.hostname.includes("github.com")) {
        return { error: "This does not appear to be a GitHub repository page." };
      }
  
      // Extract repository name (if available)
      let repoNameElem = document.querySelector('strong[itemprop="name"] a');
      repoData.name = repoNameElem ? repoNameElem.innerText.trim() : "Unknown Repo";
  
      // Extract description from meta tag (if available)
      let descElem = document.querySelector('meta[name="description"]');
      repoData.description = descElem ? descElem.content.trim() : "No description available.";
  
      // Extract full text from the page's body
      repoData.fullText = document.body.innerText;
  
      // Return the collected data
      return repoData;
    }
  })();
  