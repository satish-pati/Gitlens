// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openLoginPage') {
        openLoginPopup();
    } else if (message.action === 'checkLoginStatus') {
        checkLoginStatus();
    }
    else if (message.action === 'loggedIn') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url.includes('github.com')) {
                chrome.tabs.reload(currentTab.id);
            } else {
                // Find any GitHub tab if current is not GitHub
                chrome.tabs.query({}, (allTabs) => {
                    const githubTab = allTabs.find(tab => tab.url.includes('github.com'));
                    if (githubTab) {
                        chrome.tabs.reload(githubTab.id);
                    } else {
                        console.warn('No GitHub tab found to reload.');
                    }
                });
            }
        });        
      }
});

// Function to open the login popup window
function openLoginPopup() {
    chrome.windows.create({
        url: chrome.runtime.getURL('pages/login.html'),
        type: 'popup',
        width: 400,
        height: 600
    });
}

// Function to check if the user is logged in
function checkLoginStatus() {
    chrome.storage.local.get(['token'], (result) => {
        if (!result.token) {
            // No token found, open login page
            openLoginPopup();
        } else {
            console.log('User already logged in ✅');
        }
    });
}
