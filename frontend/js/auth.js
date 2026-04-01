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
        else if (session.user.role === 'admin') dashboardUrl = `http://localhost:5173`;

        // Determine Settings URL
        let settingsUrl = `${base}auth/settings.html`;
        
        // User is logged in
        authDiv.innerHTML = `
            <div class="user-profile" style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 4px 4px 4px 12px; border-radius: 30px; border: 1px solid var(--border);">
                <a href="${dashboardUrl}" id="navProfileBtn" class="user-name" style="font-weight: 600; text-decoration: none; color: #fff; font-size: 0.9rem;">
                  <i class="bi bi-person-circle" style="font-size: 18px; color: var(--violet); margin-right: 6px; vertical-align: middle;"></i>
                  ${escapeHTML(session.user.fullname)}
                </a>
                <div class="d-flex gap-2">
                    <a href="${settingsUrl}" class="btn-settings" title="Account Settings" style="color: var(--zinc-500); transition: 0.3s; font-size: 1.1rem; display: flex; align-items: center;"><i class="bi bi-gear"></i></a>
                    <button onclick="logout()" style="padding: 6px 16px; border-radius: 20px; background: var(--violet); border: none; color: white; cursor: pointer; transition: 0.3s; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.8rem;">
                      Logout
                    </button>
                </div>
            </div>
        `;
    }
});

function logout() {
    clearSession();
    // Redirect to home safely
    let redirectUrl = '/'; // Defaults to root
    
    // Check path to ensure cross-directory compatibility
    if (window.location.pathname.includes('/pages/')) {
        redirectUrl = '../../index.html';
    } else {
        redirectUrl = 'index.html';
    }
    
    window.location.href = redirectUrl;
}
