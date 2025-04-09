(function () {
    let detectAIButton = document.querySelector('[data-feature="ai-detection"]');

    let modal = document.createElement("div");
    modal.id = "aiModal";
    Object.assign(modal.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "300px",
        backgroundColor: "#fff",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        padding: "30px",
        zIndex: "10001",
        display: "none",
        textAlign: "center",
        fontFamily: "Arial, sans-serif"
    });

    // Close button
    let closeButton = document.createElement("span");
    closeButton.innerText = "✖";
    Object.assign(closeButton.style, {
        position: "absolute",
        top: "10px",
        right: "15px",
        cursor: "pointer",
        fontSize: "20px"
    });
    closeButton.addEventListener("click", () => modal.style.display = "none");
    modal.appendChild(closeButton);

    // AI result content with gradient stroke and center icon
    let aiResultContent = document.createElement("div");
    aiResultContent.id = "aiResultContent";
    aiResultContent.innerHTML = `
        <svg width="150" height="150">
            <defs>
                <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="green"/>
                    <stop offset="100%" stop-color="red"/>
                </linearGradient>
            </defs>
            <circle cx="75" cy="75" r="60" stroke="#e0e0e0" stroke-width="15" fill="none" />
            <circle id="aiCircle" cx="75" cy="75" r="60" stroke="url(#aiGradient)" stroke-width="15" fill="none"
                stroke-dasharray="0, 999" transform="rotate(-90 75 75)" stroke-linecap="round"/>
            <text id="centerIcon" x="75" y="80" text-anchor="middle" font-size="28">🤖</text>
        </svg>
        <div style="margin-top: 15px;">
            <div id="aiText" style="font-size: 18px; font-weight: bold;">Loading...</div>
        </div>
    `;
    modal.appendChild(aiResultContent);
    document.body.appendChild(modal);

    detectAIButton.addEventListener("click", async () => {
        modal.style.display = "block";
        updateCircle(0);
        document.getElementById("aiText").innerText = "Analyzing code...";
        document.getElementById("centerIcon").textContent = "⏳";

        getGitHubRepoDetailsFromTab(async (repoData) => {
            if (repoData.error) {
                document.getElementById("aiText").innerText = repoData.error;
                document.getElementById("centerIcon").textContent = "⚠️";
                return;
            }

            try {
                let response = await fetch("http://localhost:5000/detect_ai_code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(repoData)
                });
                let result = await response.json();
                let ai = parseFloat(result.ai_percentage);
                let human = parseFloat(result.human_percentage);
                updateCircle(ai);
                document.getElementById("aiText").innerText = `AI: ${ai}% | Human: ${human}%`;
                document.getElementById("centerIcon").textContent = ai >= 50 ? "🤖" : "👤";
            } catch (error) {
                document.getElementById("aiText").innerText = "Error: " + error.message;
                document.getElementById("centerIcon").textContent = "⚠️";
            }
        });
    });

    function updateCircle(percentage) {
        const circle = document.getElementById("aiCircle");
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const dash = (percentage / 100) * circumference;
        circle.setAttribute("stroke-dasharray", `${dash},${circumference}`);
    }

    function getGitHubRepoDetailsFromTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "aihuman" }, function (response) {
                callback(response);
            });
        });
    }
})();

