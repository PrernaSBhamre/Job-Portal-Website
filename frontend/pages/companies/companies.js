document.addEventListener('DOMContentLoaded', () => {
    setupAuthNav();
    fetchCompanies();
});

let fetchedCompanies = [];

async function fetchCompanies() {
    const container = document.getElementById('compContainer');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/companies`);
        
        if (response.ok) {
            const data = await response.json();
            
            // Map backend data to frontend rendering array
            fetchedCompanies = data;
            
            // If the database is completely empty for Companies, inject high-quality mock objects so the UI isn't empty!
            if (fetchedCompanies.length === 0) {
                fetchedCompanies = [
                    {
                        name: "TechNova Systems",
                        location: "Bangalore, India",
                        description: "TechNova is a global leader in AI-driven enterprise software solutions. We build massive scalable ecosystems used by Fortune 500 companies around the world. Known for our extensive fresher training bootcamps.",
                        website: "https://technova.example.com",
                        logo: "",
                        isVerified: true
                    },
                    {
                        name: "CloudScale Inc.",
                        location: "Pune, India",
                        description: "CloudScale provides infrastructure-as-a-service utilities for startups and fast-growing enterprises exploring big data integration.",
                        website: "https://cloudscale.example.com",
                        logo: "",
                        isVerified: true
                    },
                    {
                        name: "Innovate Digital",
                        location: "Mumbai, India",
                        description: "A premier digital agency specializing in UI/UX architecture and frontend wizardry. We hire talented frontend engineers and designers directly out of college.",
                        website: "https://innovatedigital.example.com",
                        logo: "",
                        isVerified: false
                    },
                    {
                        name: "FinSecure Tech",
                        location: "Hyderabad, India",
                        description: "FinSecure delivers robust cybersecurity algorithms tailored exclusively for banking and financial sectors. We are expanding our Node.js and Python backend team.",
                        website: "https://finsecure.example.com",
                        logo: "",
                        isVerified: true
                    }
                ];
            }
            
            renderCompanies(fetchedCompanies);
        } else {
            throw new Error("Failed to load");
        }
    } catch (err) {
        console.error("Error fetching companies:", err);
        container.innerHTML = `
            <div class="nores">
                <i class="bi bi-exclamation-triangle"></i>
                <p style="color:var(--tp);font-weight:600;font-size:1.1rem">Network Error</p>
                <p>Could not load companies from server.</p>
            </div>
        `;
    }
}

function renderCompanies(list) {
    const c = document.getElementById('compContainer');
    
    if (!list.length) {
        c.innerHTML = `
            <div class="nores">
                <i class="bi bi-search"></i>
                <p style="color:var(--tp);font-weight:600;font-size:1.1rem">No Companies Found</p>
                <p>Try adjusting your search query.</p>
            </div>`;
        return;
    }

    const colors = ['#f97316', '#7c3aed', '#22c55e', '#eab308', '#e11d48', '#0ea5e9']; // Vibrant mapped colors

    c.innerHTML = list.map((comp, index) => {
        const cColor = colors[index % colors.length];
        const initial = comp.name ? comp.name.charAt(0).toUpperCase() : 'C';
        const loc = comp.location || 'Pan India / Remote';
        const desc = comp.description || 'This company has not provided a description yet. They are verified employers on FresherHub exploring top talent.';
        const site = comp.website || '#';
        
        let logoHtml = `<div class="clogo" style="color:${cColor}; border-color: ${cColor}40; background: ${cColor}10">${initial}</div>`;
        if (comp.logo) {
            logoHtml = `<div class="clogo" style="border-color: ${cColor}40;"><img src="${comp.logo}" alt="${comp.name}"></div>`;
        }

        return `
        <div class="col-lg-4 col-md-6">
            <a href="../jobs/jobs.html?company=${encodeURIComponent(comp.name)}" class="ccard">
                ${comp.isVerified !== false ? '<div class="cbadge"><i class="bi bi-patch-check-fill"></i> VERIFIED</div>' : ''}
                ${logoHtml}
                <div class="cname">${comp.name}</div>
                <div class="cloc"><i class="bi bi-geo-alt"></i> ${loc}</div>
                <div class="cdesc">${desc}</div>
                
                <div class="cmeta">
                    <div>
                        <div class="cstat-lbl">Open Roles</div>
                        <div class="cstat">${Math.floor(Math.random() * 15) + 2}</div>
                    </div>
                    ${site !== '#' ? `<object><a href="${site}" target="_blank" class="btn-site">Website <i class="bi bi-box-arrow-up-right"></i></a></object>` : ''}
                </div>
            </a>
        </div>
        `;
    }).join('');
}

function filterCompanies() {
    const q = document.getElementById('srch').value.toLowerCase();
    
    if(!q) {
        renderCompanies(fetchedCompanies);
        return;
    }
    
    const filtered = fetchedCompanies.filter(c => {
        return (c.name && c.name.toLowerCase().includes(q)) || 
               (c.location && c.location.toLowerCase().includes(q)) ||
               (c.description && c.description.toLowerCase().includes(q));
    });
    
    renderCompanies(filtered);
}

function setupAuthNav() {
    const session = getSession();
    const authArea = document.getElementById('navAuthArea');
    if (session && session.user) {
        let dash = '../seeker/dashboard.html';
        if (session.user.role === 'recruiter') dash = '../employer/dashboard.html';
        if (session.user.role === 'admin') dash = '../admin/dashboard.html';
        
        authArea.innerHTML = `
            <a href="${dash}" class="btn-signup" style="background:var(--card);color:#fff;border:1px solid var(--border);">Dashboard</a>
            <button onclick="logout()" class="btn-login" style="background:none;border:none;">Logout</button>
        `;
    }
}
