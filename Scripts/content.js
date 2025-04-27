// content.js

function createGitLensToggleButton() {
    // Avoid duplicating the button
    if (document.getElementById('gitlens-toggle-button')) return;

    const button = document.createElement('button');
    button.id = 'gitlens-toggle-button';
    button.textContent = 'G';
    button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    width: 40px;
    height: 40px;
    background-color: #1f1f1f;
    color: white;
    border: 1px solid #444;
    border-radius: 50%;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    line-height: 40px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
`;

button.onmouseenter = () => {
    button.style.backgroundColor = '#333';
    button.style.transform = 'scale(1.05)';
};

button.onmouseleave = () => {
    button.style.backgroundColor = '#1f1f1f';
    button.style.transform = 'scale(1)';
};

    button.onclick = () => {
        const existingPanel = document.getElementById('gitlens-panel-frame');
        if (existingPanel) {
            existingPanel.remove();
            document.body.classList.remove('gitlens-enabled');
            button.textContent = 'Open GitLens';
        } else {
            injectGitLensPanel();
            button.textContent = 'Close GitLens';
        }
    };

    document.body.appendChild(button);
}

function injectGitLensPanel() {
    // Avoid injecting twice
    if (document.getElementById('gitlens-panel-frame')) return;

    const iframe = document.createElement('iframe');
    iframe.id = 'gitlens-panel-frame';
    iframe.src = chrome.runtime.getURL('pages/gitlens-panel.html');
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 35%;
        height: 100vh;
        border: none;
        z-index: 10000;
        background: #0d1117;
        box-shadow: -2px 0 10px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(iframe);

    const layout = document.querySelector('.Layout');
    if (layout) {
        layout.style.width = '65%';
        layout.style.marginRight = '0';
    }

    document.body.classList.add('gitlens-enabled');
}

// Run this on GitHub pages
if (window.location.hostname.includes("github.com")) {
    createGitLensToggleButton();
}
window.addEventListener('message', (event) => {
    if (event.data?.type === 'CLOSE_GITLENS_PANEL') {
        const panel = document.getElementById('gitlens-panel-frame');
        if (panel) {
            panel.remove();
            document.body.classList.remove('gitlens-enabled');
            const button = document.getElementById('gitlens-toggle-button');
            if (button) button.textContent = 'Open GitLens';
        }
    }
});
