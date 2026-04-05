// Centralized Authentication & Session Management

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

// Global Styles for Profile Dropdown
function injectProfileStyles() {
    if (document.getElementById('profile-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'profile-dropdown-styles';
    style.textContent = `
        .profile-dropdown {
            position: relative;
            display: inline-block;
        }
        .profile-trigger {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .profile-trigger:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--violet, #8b5cf6);
        }
        .avatar-circle {
            width: 32px;
            height: 32px;
            background: var(--violet, #8b5cf6);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
            box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
        }
        .user-info-text {
            color: white;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .dropdown-menu-custom {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 240px;
            background: #12121a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            display: none;
            flex-direction: column;
            padding: 8px;
            z-index: 2000;
            backdrop-filter: blur(20px);
            animation: slideUp 0.3s ease;
        }
        .dropdown-menu-custom.active {
            display: flex;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-header {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 8px;
        }
        .header-name {
            display: block;
            color: white;
            font-weight: 700;
            font-size: 0.95rem;
        }
        .header-role {
            display: block;
            color: #94a3b8;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }
        .dropdown-item-custom {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 10px;
            transition: all 0.2s ease;
        }
        .dropdown-item-custom:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            transform: translateX(4px);
        }
        .dropdown-item-custom i {
            font-size: 1.1rem;
            color: var(--violet, #8b5cf6);
        }
        .dropdown-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.05);
            margin: 8px 16px;
        }
        .logout-btn-custom {
            color: #f87171;
        }
        .logout-btn-custom i {
            color: #f87171 !important;
        }
        .logout-btn-custom:hover {
            background: rgba(248, 113, 113, 0.1);
            color: #f87171;
        }
    `;
    document.head.appendChild(style);
}

// Update Navbar if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    const authDiv = document.querySelector('.auth, .auth-btns, #navbarAuth');

    // Basic XSS Sanitizer
    const escapeHTML = (str) => {
        let div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    if (session && authDiv) {
        injectProfileStyles();

        // Build paths
        let depth = window.location.pathname.split('/').length - 1;
        let base = '';
        if (window.location.pathname.includes('pages/')) {
            base = '../';
        } else {
            base = 'pages/';
        }
        
        // Correct base if we are deeper in subfolders (e.g., jobs/job-details.html)
        if (window.location.pathname.split('/').slice(-2)[0] === 'jobs' || 
            window.location.pathname.split('/').slice(-2)[0] === 'seeker' ||
            window.location.pathname.split('/').slice(-2)[0] === 'employer') {
            base = '../';
        }
        // Special case for root files
        if (!window.location.pathname.includes('/pages/')) {
            base = 'pages/';
        } else if (window.location.pathname.split('pages/')[1].includes('/')) {
            // We are likely in a subfolder like pages/seeker/
            base = '../';
        }

        let profileUrl = `${base}seeker/profile.html`;
        let dashboardUrl = `${base}seeker/dashboard.html`;
        let roleName = 'Job Seeker';
        
        const userRole = (session.user.role || '').toLowerCase();
        
        if (userRole === 'recruiter') {
            profileUrl = `${base}employer/profile.html`;
            dashboardUrl = `${base}employer/dashboard.html`;
            roleName = 'Employer';
        } else if (userRole === 'admin') {
            profileUrl = `http://localhost:5173`; // Admin has its own portal
            dashboardUrl = profileUrl;
            roleName = 'Administrator';
        }

        let settingsUrl = `${base}auth/settings.html`;
        
        // Get Initials
        const initials = session.user.fullname
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        // Inject Dropdown HTML
        authDiv.innerHTML = `
            <div class="profile-dropdown">
                <div class="profile-trigger" id="profileTrigger" title="${escapeHTML(session.user.fullname)}">
                    <div class="avatar-circle">${initials}</div>
                    <i class="bi bi-chevron-down text-zinc-500" style="font-size: 0.7rem;"></i>
                </div>
                <div class="dropdown-menu-custom" id="profileDropdown">
                    <div class="dropdown-header">
                        <span class="header-name">${escapeHTML(session.user.fullname)}</span>
                        <span class="header-role">${roleName}</span>
                    </div>
                    <a href="${profileUrl}" class="dropdown-item-custom">
                        <i class="bi bi-person-bounding-box"></i>
                        Profile
                    </a>
                    <a href="${dashboardUrl}" class="dropdown-item-custom">
                        <i class="bi bi-grid-1x2-fill"></i>
                        Dashboard
                    </a>
                    <a href="${settingsUrl}" class="dropdown-item-custom">
                        <i class="bi bi-gear-wide-connected"></i>
                        Account Settings
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="logout(); return false;" class="dropdown-item-custom logout-btn-custom">
                        <i class="bi bi-box-arrow-right"></i>
                        Logout
                    </a>
                </div>
            </div>
        `;

        // Toggle Logic
        const trigger = document.getElementById('profileTrigger');
        const dropdown = document.getElementById('profileDropdown');

        if (trigger && dropdown) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    }
});

function logout() {
    clearSession();
    // Redirect to home safely
    let redirectUrl = '/'; // Defaults to root
    
    // Check path to ensure cross-directory compatibility
    if (window.location.pathname.includes('/pages/')) {
        // If we are in pages/seeker/dashboard.html, we need to go up two levels to reach index.html
        if (window.location.pathname.split('pages/')[1].includes('/')) {
            redirectUrl = '../../index.html';
        } else {
            redirectUrl = '../index.html';
        }
    } else {
        redirectUrl = 'index.html';
    }
    
    window.location.href = redirectUrl;
}
