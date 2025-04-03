document.getElementById('summarizeButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeRepoDetails,
  }, async (results) => {
    if (chrome.runtime.lastError) {
      document.getElementById('summary').innerText = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    
    let repoData = results[0].result;

    if (repoData.error) {
      document.getElementById('summary').innerText = repoData.error;
      return;
    }

    // Log extracted data in the console
    console.log(" Extracted Repo Data:", repoData);

    document.getElementById('summary').innerText = 'Generating detailed summary...';

    try {
      let response = await fetch('http://localhost:5000/generate_summary', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(repoData)
      });
      let result = await response.json();
      document.getElementById('summary').innerText = result.summary;
    } catch (error) {
      document.getElementById('summary').innerText = 'Error contacting backend: ' + error.message;
    }
  });
});

// This function extracts all visible text from the page's body plus some extra fields.
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

  // Extract the entire text content of the body
  repoData.fullText = document.body.innerText;

  // Log extracted data
  console.log(" Scraped Repo Data:", repoData);
  
  return repoData;
}
