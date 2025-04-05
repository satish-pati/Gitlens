// Function to inject the GitLens panel
function injectGitLensPanel() {
    // Remove any existing panel
    removeGitLensPanel();

    // Add class to body for layout adjustments
    document.body.classList.add('gitlens-enabled');

    // Create iframe for the panel
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
        z-index: 100;
        background: var(--primary-bg, #0d1117);
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
    `;

    // Add the iframe to the page
    document.body.appendChild(iframe);

    // Adjust GitHub's layout
    const layout = document.querySelector('.Layout');
    if (layout) {
        layout.style.cssText = `
            width: 65% !important;
    margin-right: 0 !important;
        `;
    }

    // Adjust header
    const header = document.querySelector('.Header');
    if (header) {
        header.style.cssText = `
            width: 65% !important;
            left: 0 !important;
        `;
    }
}

// Function to check if we're on a GitHub repository page
function isGitHubRepoPage() {
    return window.location.hostname === 'github.com' && 
           document.querySelector('.repository-content') !== null;
}

// Function to remove the panel
function removeGitLensPanel() {
    const iframe = document.getElementById('gitlens-panel-frame');
    if (iframe) {
        iframe.remove();
    }
    document.body.classList.remove('gitlens-enabled');

    // Reset GitHub's layout
    const layout = document.querySelector('.Layout');
    if (layout) {
        layout.style.width = '';
        layout.style.marginRight = '';
    }
}

// Initialize the extension
function initialize() {
    if (isGitHubRepoPage()) {
        injectGitLensPanel();
    }
}

// Listen for page changes (for single-page app navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        removeGitLensPanel();
        if (isGitHubRepoPage()) {
            injectGitLensPanel();
        }
    }
}).observe(document, { subtree: true, childList: true });

// Initial load
initialize();
