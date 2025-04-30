// Check if we're on a GitHub page
function isGitHubPage() {
    return window.location.hostname.includes('github.com');
}

if (isGitHubPage()) {
    console.log("GitLens: On GitHub page, checking login status");

    chrome.storage.local.get(['token', 'user'], (data) => {
        if (!data.token) {
            console.log("GitLens: No token found, injecting login button");
            injectLoginButton();
        } else {
            console.log("GitLens: User is logged in");
            injectLogoutContainer(data.user);
        }
    });

    function injectLoginButton() {
        if (document.getElementById('gitlens-login-button')) {
            console.log("GitLens: Login button already exists");
            return;
        }

        const button = document.createElement('button');
        button.id = 'gitlens-login-button';
        button.innerText = 'Login';
        Object.assign(button.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: '10000',
            padding: '10px 20px',
            backgroundColor: '#2ea44f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease'
        });

        button.onmouseover = () => button.style.backgroundColor = '#238636';
        button.onmouseout = () => button.style.backgroundColor = '#2ea44f';

        button.onclick = () => {
            console.log("GitLens: Login button clicked");
            chrome.runtime.sendMessage({ action: 'openLoginPage' });
        };

        document.body.appendChild(button);
        console.log("GitLens: Login button injected");
    }

    function injectLogoutContainer(user) {
        // Avoid duplicate container
        if (document.getElementById('gitlens-logout-container')) {
            console.log("GitLens: Logout container already exists");
            return;
        }

        const container = document.createElement('div');
        container.id = 'gitlens-logout-container';

        Object.assign(container.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: '10000',
            padding: '10px',
            backgroundColor: '#161b22',
            color: 'white',
            border: '1px solid #30363d',
            borderRadius: '8px',
            fontSize: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-start',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)'
        });

        const userName = user?.name || user?.email || 'User';
        const userInfo = document.createElement('div');
        userInfo.innerHTML = `<span style="color: #58a6ff;">👤 ${userName}</span>`;

        const logoutButton = document.createElement('button');
        logoutButton.innerText = 'Logout';
        styleSmallButton(logoutButton);

        logoutButton.onclick = () => {
            chrome.storage.local.remove(['token', 'user'], () => {
                console.log("GitLens: User logged out");
                container.remove();
                injectLoginButton();
                showNotification('Logged out successfully!');
            });
        };

        const bookmarkButton = document.createElement('button');
        bookmarkButton.innerText = '🔖 Bookmark This Page';
        styleSmallButton(bookmarkButton);

        bookmarkButton.onclick = () => {
            console.log("GitLens: Bookmark button clicked");
            saveBookmark(user);
        };

        const viewBookmarksButton = document.createElement('button');
        viewBookmarksButton.innerText = '📚 View Bookmarks';
        styleSmallButton(viewBookmarksButton);

        viewBookmarksButton.onclick = () => {
            console.log("GitLens: View Bookmarks button clicked");
            showBookmarks(user);
        };

        container.appendChild(userInfo);
        container.appendChild(bookmarkButton);
        container.appendChild(viewBookmarksButton);
        container.appendChild(logoutButton);

        document.body.appendChild(container);
    }

    function styleSmallButton(button) {
        Object.assign(button.style, {
            padding: '5px 10px',
            backgroundColor: '#30363d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            width: '100%'
        });
        button.onmouseover = () => button.style.backgroundColor = '#444c56';
        button.onmouseout = () => button.style.backgroundColor = '#30363d';
    }

    function saveBookmark(user) {
        const pageUrl = window.location.href;
        const userEmail = user.email;

        chrome.storage.local.get(['bookmarks'], (result) => {
            let bookmarks = result.bookmarks || {};

            if (!bookmarks[userEmail]) {
                bookmarks[userEmail] = [];
            }

            if (!bookmarks[userEmail].includes(pageUrl)) {
                bookmarks[userEmail].push(pageUrl);

                chrome.storage.local.set({ bookmarks }, () => {
                    console.log('GitLens: Bookmark saved');
                    showNotification('Page bookmarked successfully!');
                });
            } else {
                showNotification('This page is already bookmarked.');
            }
        });
    }

    function showBookmarks(user) {
        const userEmail = user.email;

        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks?.[userEmail] || [];

            if (document.getElementById('gitlens-bookmark-list')) {
                document.getElementById('gitlens-bookmark-list').remove();
            }

            const listContainer = document.createElement('div');
            listContainer.id = 'gitlens-bookmark-list';
            Object.assign(listContainer.style, {
                position: 'fixed',
                top: '150px',
                left: '20px',
                width: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                backgroundColor: '#0d1117',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #30363d',
                zIndex: '10001',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
            });

            if (bookmarks.length === 0) {
                listContainer.innerHTML = '<div>No bookmarks yet.</div>';
            } else {
                bookmarks.forEach(url => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.textContent = url;
                    link.target = '_blank';
                    link.style.display = 'block';
                    link.style.color = '#58a6ff';
                    link.style.marginBottom = '8px';
                    listContainer.appendChild(link);
                });
            }

            document.body.appendChild(listContainer);

            // Close after clicking anywhere outside
            setTimeout(() => {
                window.addEventListener('click', function handleOutsideClick(event) {
                    if (!listContainer.contains(event.target)) {
                        listContainer.remove();
                        window.removeEventListener('click', handleOutsideClick);
                    }
                });
            }, 100);
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');

        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#0d1117',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid #30363d',
            zIndex: '10001',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-in-out'
        });

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Listen for login success
    chrome.runtime.onMessage.addListener((message) => {
        console.log("GitLens: Message received:", message);
        if (message.action === 'loggedIn') {
            const loginButton = document.getElementById('gitlens-login-button');
            if (loginButton) {
                loginButton.remove();
                location.reload();
            }
            chrome.storage.local.get(['user'], (data) => {
                injectLogoutContainer(data.user);
            });
        }
    });
}
