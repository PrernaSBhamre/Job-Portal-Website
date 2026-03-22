// Centralized Authenication & Session Management

// Save session
function setSession(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
}

// Get session
function getSession() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
        return { user: JSON.parse(user), token };
    }
    return null;
}

// Clear session
function clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

// Update Navbar if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    const authDiv = document.querySelector('.auth, .auth-btns');

    // Basic XSS Santizer
    const escapeHTML = (str) => {
        let div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    if (session && authDiv) {
        // Build correct path to dashboard
        let depth = window.location.pathname.split('/').length - 1;
        let base = '';
        if (window.location.pathname.includes('pages/')) {
            base = '../';
        } else {
            base = 'pages/';
        }
        
        let dashboardUrl = `${base}seeker/dashboard.html`;
        if (session.user.role === 'recruiter') dashboardUrl = `${base}employer/dashboard.html`;
        else if (session.user.role === 'admin') dashboardUrl = `${base}admin/dashboard.html`;

        // User is logged in
        authDiv.innerHTML = `
            <div class="user-profile" style="display: flex; align-items: center; gap: 15px;">
                <a href="${dashboardUrl}" id="navProfileBtn" class="user-name" style="font-weight: 500; text-decoration: none; color: #fff;">
                  <i class="bi bi-person-circle" style="font-size: 20px; color: #a78bfa; margin-right: 5px; vertical-align: middle;"></i>
                  ${escapeHTML(session.user.fullname)}
                </a>
                <button onclick="logout()" style="padding: 8px 15px; border-radius: 30px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: white; cursor: pointer; transition: 0.3s; font-family: 'Inter', sans-serif;">
                  Logout
                </button>
            </div>
        `;
    }
});

function logout() {
    clearSession();
    // Redirect to home relative to current path
    // Let's ensure it redirects properly based on standard path structure
    let depth = window.location.pathname.split('/').length - 1;
    let redirectUrl = '../../index.html';
    
    // Simplistic handling, mostly for safety
    if (window.location.pathname.includes('pages/auth/')) redirectUrl = '../../index.html';
    else if (window.location.pathname.includes('pages/jobs/')) redirectUrl = '../../index.html';
    else redirectUrl = 'index.html'; // root level
    
    // Provide a neat experience
    alert("Logged out successfully");
    window.location.href = redirectUrl;
}
