// Toggle between login and signup forms
document.getElementById('switch-to-signup').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('switch-to-login').addEventListener('click', () => {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

// Handle login form submission
// In login.js, after successful login:
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            await chrome.storage.local.set({ 
                token: data.token,
                user: { 
                    name: data.user.name, 
                    email: data.user.email 
                }
            });
            alert('Login successful!');
        
            // First, send the message
            chrome.runtime.sendMessage({ action: 'loggedIn' });
        
            // Then close window after a short delay
            setTimeout(() => {
                window.close();
            }, 300); // 300ms is usually enough
        }
         else {
            alert(data.message || 'Login failed. Try again!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Server not reachable. Please try again later.');
    }
});

// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Account created successfully! Please login.');
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            
            // Pre-fill the login form with the email
            document.getElementById('email').value = email;
        } else {
            alert(data.message || 'Signup failed. Try again!');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Server not reachable. Please try again later.');
    }
});