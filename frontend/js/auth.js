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

        /* Mobile Drawer Styles */
        .mobile-nav-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 5000; opacity: 0; pointer-events: none; transition: 0.3s;
        }
        .mobile-nav-overlay.active { opacity: 1; pointer-events: all; }
        .mobile-nav-drawer {
            position: fixed; top: 0; right: -300px; width: 280px; height: 100%;
            background: #09090b; border-left: 1px solid var(--border);
            z-index: 5001; padding: 40px 24px; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column; gap: 15px;
        }
        .mobile-nav-drawer.active { right: 0; }
        .mobile-nav-header { 
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; 
        }
        .mobile-nav-links a {
            color: #94a3b8; text-decoration: none; font-size: 1.1rem; font-weight: 600;
            padding: 12px 16px; border-radius: 12px; transition: 0.2s; display: block;
        }
        .mobile-nav-links a:hover, .mobile-nav-links a.active { color: white; background: rgba(255,255,255,0.05); }
        .mobile-nav-links a.active { color: var(--violet); }
    `;
    document.head.appendChild(style);
}

// Consolidated Path Helper
function getRelPath(target) {
    const p = window.location.pathname;
    let base = '';
    if (p.includes('/pages/')) {
        if (p.split('pages/')[1].includes('/')) base = '../../';
        else base = '../';
    } else if (p.includes('/admin-portal/')) {
        base = '../';
    } else {
        base = 'pages/';
    }
    
    if (target === 'root') return p.includes('/pages/') ? base + 'index.html' : 'index.html';
    if (target === 'jobs') return p.includes('/pages/') ? base + 'pages/jobs/jobs.html' : 'pages/jobs/jobs.html';
    return base;
}

// Update Navbar Responsive Header
document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    const navCont = document.querySelector('.navbar-custom');
    
    // Add Hamburger to ALL Navbars
    if (navCont && !document.getElementById('mob-toggle')) {
        const toggle = document.createElement('div');
        toggle.id = 'mob-toggle';
        toggle.className = 'd-lg-none ms-auto me-3';
        toggle.style.cursor = 'pointer';
        toggle.innerHTML = `<i class="bi bi-list" style="font-size: 1.8rem; color: white;"></i>`;
        
        const authBtns = navCont.querySelector('.auth-btns');
        if (authBtns) navCont.insertBefore(toggle, authBtns);
        else navCont.appendChild(toggle);

        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay'; overlay.id = 'mob-overlay';
        const drawer = document.createElement('div');
        drawer.className = 'mobile-nav-drawer'; drawer.id = 'mob-drawer';
        
        const homeUrl = getRelPath('root');
        const jobsUrl = getRelPath('jobs');
        
        drawer.innerHTML = `
            <div class="mobile-nav-header">
                <div style="font-weight:800; font-size:1.4rem; color:white;">Tools<span>&Job</span></div>
                <i class="bi bi-x-lg" id="mob-close" style="font-size:1.5rem; color:var(--ts); cursor:pointer;"></i>
            </div>
            <div class="mobile-nav-links">
                <a href="${homeUrl}">Home</a>
                <a href="${jobsUrl}">Find Jobs</a>
                <a href="#">Companies</a>
                <a href="#">Services</a>
                <a href="#">Resources</a>
            </div>
            <div class="mt-auto pt-4" style="border-top: 1px solid var(--border);">
                <p style="font-size:0.75rem; color:var(--ts); text-align:center;">&copy; 2026 Tools & Job Portal</p>
            </div>
        `;
        document.body.appendChild(overlay); document.body.appendChild(drawer);
        const closeMob = () => { overlay.classList.remove('active'); drawer.classList.remove('active'); };
        toggle.onclick = () => { overlay.classList.add('active'); drawer.classList.add('active'); };
        overlay.onclick = closeMob;
        document.getElementById('mob-close').onclick = closeMob;
    }

    const authDivs = document.querySelectorAll('.auth, .auth-btns, #navbarAuth, #navAuthArea');
    if (session && session.user && authDivs.length > 0) {
        injectProfileStyles();

        // Build paths
        let base = '';
        const p = window.location.pathname;
        if (p.includes('/pages/')) {
            if (p.split('pages/')[1].includes('/')) base = '../../';
            else base = '../';
        } else if (p.includes('/admin-portal/')) {
            base = '../';
        } else {
            base = 'pages/';
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
            profileUrl = `http://localhost:5173`; 
            dashboardUrl = profileUrl;
            roleName = 'Administrator';
        }

        let settingsUrl = `${base}auth/settings.html`;
        const initials = session.user.fullname
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        authDivs.forEach(div => {
            div.innerHTML = `
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
                            <i class="bi bi-person-bounding-box"></i> Profile
                        </a>
                        <a href="${dashboardUrl}" class="dropdown-item-custom">
                            <i class="bi bi-grid-1x2-fill"></i> Dashboard
                        </a>
                        <a href="${settingsUrl}" class="dropdown-item-custom">
                            <i class="bi bi-gear-wide-connected"></i> Settings
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" onclick="logout(); return false;" class="dropdown-item-custom logout-btn-custom">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </a>
                    </div>
                </div>
            `;
        });

        // Toggle Logic for all triggers
        document.body.addEventListener('click', (e) => {
            const trigger = e.target.closest('.profile-trigger');
            const dropdowns = document.querySelectorAll('.dropdown-menu-custom');
            if (trigger) {
                e.preventDefault(); e.stopPropagation();
                const dropdown = trigger.nextElementSibling;
                dropdown.classList.toggle('active');
                dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('active'); });
            } else { dropdowns.forEach(d => d.classList.remove('active')); }
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-pill a, .mobile-nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const isHome = href.includes('index.html') || href === '/' || href === '../../index.html' || href === '../index.html';
        const isJobs = href.includes('jobs.html');
        if (isJobs && currentPath.includes('jobs.html')) link.classList.add('active');
        else if (isHome && (currentPath.endsWith('/') || currentPath.includes('index.html'))) link.classList.add('active');
        else link.classList.remove('active');
    });
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
