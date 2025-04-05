// contentScript.js (runs in actual GitHub tab)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeRepoDetails") {
        let repoData = {};

        if (!document.location.hostname.includes("github.com")) {
            sendResponse({ error: "This is not a GitHub repository page." });
            return true;
        }

        let repoNameElem = document.querySelector('strong[itemprop="name"] a');
        repoData.name = repoNameElem ? repoNameElem.innerText.trim() : "Unknown Repo";
        let descElem = document.querySelector('meta[name="description"]');
        repoData.description = descElem ? descElem.content.trim() : "No description available.";
        repoData.fullText = document.body.innerText;

        sendResponse(repoData);
    }
    if (message.action === "codesummarize") {
        //let selectedLang = document.getElementById("codeLanguageSelect").value;
    let codeLines = [];
      document.querySelectorAll(".application-main ").forEach(line => {
        codeLines.push(line.innerText);
      });
      let codeText = codeLines.join("\n");
      
      if (!codeText) {
        analysisContent.innerText = "No code found on this page.";
        return;
      }
      
      
      sendResponse(codeText);
    }
    if (message.action === "aihuman") {
        let repoData = {};

        if (!document.location.hostname.includes("github.com")) {
            sendResponse({ error: "This is not a GitHub repository page." });
            return true;
        }

        let repoNameElem = document.querySelector('strong[itemprop="name"] a');
        repoData.name = repoNameElem ? repoNameElem.innerText.trim() : "Unknown Repo";
        let descElem = document.querySelector('meta[name="description"]');
        repoData.description = descElem ? descElem.content.trim() : "No description available.";
        repoData.fullText = document.body.innerText;

        sendResponse(repoData);
    }
    if (message.action === "pr_analysis") {
        const repoInfo = window.location.pathname.split("/");
        if (repoInfo.length < 3) {
            alert("Unable to detect repository details.");
            return;
        }

        const owner = repoInfo[1];
        const repo = repoInfo[2];
        const repoUrl = `https://github.com/${owner}/${repo}`;

        sendResponse(repoUrl);
    }
    if (message.action === "autocomments") {
        const repoInfo = window.location.pathname.split("/");
        console.log("refoinfo",repoInfo);
        if (repoInfo.length < 3) {
            alert("Unable to detect repository details.");
            return;
        }

        

        sendResponse(repoInfo);
    }
    
    
});
