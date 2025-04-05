(async function () {
    if (!window.location.href.includes("github.com")) return;

    let fetchedPRs = [];

    function injectButton() {
        const navBar = document.querySelector(".repository-content");
        if (!navBar || document.getElementById("pr-analysis-btn")) return;

        const button = document.createElement("button");
        button.id = "pr-analysis-btn";
        button.innerText = "PR Analysis";
        button.style.cssText = "padding: 8px 15px; margin: 10px; background-color:rgb(66, 119, 162); color: white; border: none; border-radius: 6px; cursor: pointer;";
        button.onclick = fetchPullRequests;
        button.style.position='fixed';
        navBar.prepend(button);
    }
    function showLoadingModal() {
        let modal = document.getElementById("loading-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "loading-modal";
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 150px;
                height: 150px;
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
    
            modal.innerHTML = `<div class="loader"></div>`;
    
            document.body.appendChild(modal);
        }
    }    
    // Function to hide the loading modal
    function hideLoadingModal() {
        const modal = document.getElementById("loading-modal");
        if (modal) modal.remove();
    }
    function injectLoaderStyles() {
        let loaderStyle = document.createElement("style");
        loaderStyle.innerHTML = `
            .loader {
                position: relative;
                width: 2.5em;
                height: 2.5em;
                transform: rotate(165deg);
            }
    
            .loader:before, .loader:after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                display: block;
                width: 0.5em;
                height: 0.5em;
                border-radius: 0.25em;
                transform: translate(-50%, -50%);
            }
    
            .loader:before {
                animation: before8 2s infinite;
            }
    
            .loader:after {
                animation: after6 2s infinite;
            }
    
            @keyframes before8 {
                0% {
                    width: 0.5em;
                    box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
                }
                35% {
                    width: 2.5em;
                    box-shadow: 0 -0.5em rgba(225, 20, 98, 0.75), 0 0.5em rgba(111, 202, 220, 0.75);
                }
                70% {
                    width: 0.5em;
                    box-shadow: -1em -0.5em rgba(225, 20, 98, 0.75), 1em 0.5em rgba(111, 202, 220, 0.75);
                }
                100% {
                    box-shadow: 1em -0.5em rgba(225, 20, 98, 0.75), -1em 0.5em rgba(111, 202, 220, 0.75);
                }
            }
    
            @keyframes after6 {
                0% {
                    height: 0.5em;
                    box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
                }
                35% {
                    height: 2.5em;
                    box-shadow: 0.5em 0 rgba(61, 184, 143, 0.75), -0.5em 0 rgba(233, 169, 32, 0.75);
                }
                70% {
                    height: 0.5em;
                    box-shadow: 0.5em -1em rgba(61, 184, 143, 0.75), -0.5em 1em rgba(233, 169, 32, 0.75);
                }
                100% {
                    box-shadow: 0.5em 1em rgba(61, 184, 143, 0.75), -0.5em -1em rgba(233, 169, 32, 0.75);
                }
            }
    
            .loader {
                position: absolute;
                top: calc(50% - 1.25em);
                left: calc(50% - 1.25em);
            }
        `;
        document.head.appendChild(loaderStyle);
    }

    injectLoaderStyles();
    async function fetchPullRequests() {
        const repoInfo = window.location.pathname.split("/");
        if (repoInfo.length < 3) {
            alert("Unable to detect repository details.");
            return;
        }

        const owner = repoInfo[1];
        const repo = repoInfo[2];
        const repoUrl = `https://github.com/${owner}/${repo}`;
        let modal = document.getElementById("loading-modal");
        showLoadingModal();
        try {
            const response = await fetch(`http://127.0.0.1:5000/get_latest_pr_data?repo_url=${encodeURIComponent(repoUrl)}`);
            if (!response.ok) throw new Error("Failed to fetch PRs");
            const data = await response.json();
            fetchedPRs = data;
            hideLoadingModal();
            displayPRs(data);
        } catch (error) {
            console.error("Error fetching PRs:", error);
            alert("Failed to load PRs.");
        }
    }
    function displayPRs(pullRequests) {
        let modal = document.getElementById("pr-analysis-modal");
        if (modal) modal.remove(); 
    
        modal = document.createElement("div");
        modal.id = "pr-analysis-modal";
        modal.style.cssText = `
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 70%;
            background: white;
            color: black;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-height: 80vh;
            overflow-y: auto;
        `;
    
        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.style.cssText = "float: right; background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;";
        closeButton.addEventListener("click", () => modal.remove());
    
        let tableHTML = `
            <h2>Recent Pull Requests</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #333; color: white;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Title</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Author</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Created At</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Lines Modified</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">State</th>
                    </tr>
                </thead>
                <tbody id="pr-table-body">
        `;
    
        pullRequests.forEach((pr, index) => {
            tableHTML += `
                <tr style="cursor: pointer;" data-index="${index}">
                    <td style="border: 1px solid #ddd; padding: 8px;">${pr.Title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${pr.Author}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${pr["Created At"]}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${pr["Total Changes"]}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${pr.State}</td>
                </tr>
            `;
        });
    
        tableHTML += `</tbody></table>`;
        modal.innerHTML = tableHTML;
        modal.appendChild(closeButton);
        document.body.appendChild(modal);
        document.querySelectorAll("#pr-table-body tr").forEach(row => {
            row.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                showPRDetailsModal(index);
            });
        });
        window.fetchedPRs = pullRequests;
    }
    
    
    async function showPRDetailsModal(index) {
        const pr = window.fetchedPRs[index]; 
        if (!pr) {
            console.error("Invalid PR index:", index);
            return;
        }
    
        const repoUrl = window.location.origin + window.location.pathname;
        console.log("PR Object:", pr);
    
        // ✅ Extract only the PR number
        let prNumberCleaned = pr.Number.match(/\d+/)[0]; 
    
        console.log("Sending Request to /pr_analysis:", {
            repo_url: repoUrl,
            pr_number: prNumberCleaned
        });
    
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            background: #fff;
            color: #000;
            padding: 20px;
            border-radius: 10px;
            z-index: 1100;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
        `;
    
        let html = `<h3>Details for: ${pr.Title}</h3>`;
    
        pr["Files Modified"].forEach(file => {
            html += `<h4>📄 File: ${file.File}</h4>`;
    
            if (file["Added Lines"] && file["Added Lines"].length > 0) {
                html += `<p style="color: green;"><strong>+ Added Lines:</strong></p>
                         <pre style="color: green; background: #f0fff0; padding: 10px;">${file["Added Lines"].join("\n")}</pre>`;
            }
    
            if (file["Removed Lines"] && file["Removed Lines"].length > 0) {
                html += `<p style="color: red;"><strong>- Removed Lines:</strong></p>
                         <pre style="color: red; background: #fff0f0; padding: 10px;">${file["Removed Lines"].join("\n")}</pre>`;
            }
        });
    
        html += `<h4> PR Description: </h4><p id="ai-analysis">Fetching analysis...</p>`;
    
        modal.innerHTML = html;
    
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        closeBtn.style.cssText = "margin-top: 10px; background: red; color: white; padding: 5px 10px; border: none; cursor: pointer;";
        closeBtn.onclick = () => modal.remove();
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
    
        // 🔹 Call Flask `/pr_analysis` route
        try {
            const response = await fetch("http://127.0.0.1:5000/pr_analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    repo_url: repoUrl,
                    pr_number: prNumberCleaned
                })
            });
    
            const data = await response.json();
            console.log("AI Analysis Response summary:", data.summary);
            if (data) {
                document.getElementById("ai-analysis").innerHTML = data.summary;
            } else {
                document.getElementById("ai-analysis").innerText = "Failed to fetch analysis.";
            }
        } catch (error) {
            console.error("Error fetching PR analysis:", error);
            document.getElementById("ai-analysis").innerText = "Error fetching AI analysis.";
        }
    }
    
    injectButton();
})();
