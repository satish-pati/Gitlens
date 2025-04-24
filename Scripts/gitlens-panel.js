document.addEventListener("DOMContentLoaded", () => {
    const featureCards = document.querySelectorAll(".feature-card");

    featureCards.forEach(card => {
        card.addEventListener("click", () => {
            const feature = card.dataset.feature;
            const view = document.getElementById(`${feature}-view`);

            // Hide all views
            document.querySelectorAll(".detail-view").forEach(v => v.style.display = "none");

            // Show the selected view
            if (view) {
                view.style.display = "block";
                // Load dynamic content if needed
                switch (feature) {
                    case "comment-generator":
                        loadScript("../scripts/injectcomment.js");
                        break;
                    case "pr-analysis":
                        loadScript("../scripts/pr_analysis.js");
                        break;
                    case "repo-summary":
                        loadScript("../scripts/injectcodesumm.js");
                        break;
                    case "ai-detection":
                        loadScript("../scripts/aihuman.js");
                        break;
                    case "dependency-viz":
                        loadScript("../scripts/dependency.js");
                        break;
                    case "Summary-repo":
                            loadScript("../scripts/injectsumm.js");
                            break;
                }
            }
        });
    });

    function loadScript(src) {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) return; // Prevent reloading
        const script = document.createElement("script");
        script.src = src;
        document.body.appendChild(script);
    }
});
document.querySelector(".close-popup").addEventListener("click", () => {
    document.getElementById("comment-popup").style.display = "none";
});
document.getElementById("close-comments").addEventListener("click", () => {
    document.getElementById("comment-popup").style.display = "none";
});
document.getElementById('close-btn').addEventListener('click', () => {
    // Send message to parent to close the panel
    const panel = document.getElementById('gitlens-panel-frame');
    if (panel) {
        panel.remove();
        document.body.classList.remove('gitlens-enabled');
        const button = document.getElementById('gitlens-toggle-button');
        if (button) button.textContent = 'G';
    }
    window.parent.postMessage({ type: 'CLOSE_GITLENS_PANEL' }, '*');
});
