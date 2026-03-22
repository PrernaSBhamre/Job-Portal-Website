document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedJobs();
    setupHeroSearch();
});

async function fetchFeaturedJobs() {
    const grid = document.getElementById('featured-jobs-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/jobs`);
        if (response.ok) {
            const data = await response.json();
            // Take the latest 6 jobs
            const jobsToDisplay = data.slice(0, 6);
            
            if (jobsToDisplay.length === 0) {
                grid.innerHTML = '<p style="color: #94a3b8; text-align: center; width: 100%;">No featured jobs available.</p>';
                return;
            }

            const colors = ['#5b21b6', '#1d4ed8', '#be185d', '#c2410c', '#047857', '#0f766e', '#b45309', '#e11d48'];

            grid.innerHTML = jobsToDisplay.map((j, index) => {
                const companyName = j.company && j.company.name ? j.company.name : 'Unknown Company';
                const initial = companyName.charAt(0).toUpperCase() + (companyName.length > 1 ? companyName.charAt(1).toUpperCase() : '');
                
                // Max 3 tags
                const tags = (j.tags && j.tags.length > 0 ? j.tags : ['JAVASCRIPT', 'HTML', 'CSS']).slice(0, 3);
                
                return `
                <a href="pages/jobs/job-details.html?id=${j._id || j.id}" class="job-card" style="text-decoration: none;">
                  <div class="jc-head">
                    <div class="co-av">${initial}</div>
                    <div>
                      <div class="jc-title">${j.title}</div>
                      <div class="jc-co"><i class="bi bi-building"></i> ${companyName}</div>
                    </div>
                  </div>
                  <div class="jc-tags">
                    ${tags.map(t => `<span class="j-tag">${t.toUpperCase()}</span>`).join('')}
                  </div>
                  <div class="jc-meta">
                    <span><i class="bi bi-geo-alt"></i> ${j.location || 'Remote'}</span>
                    <span><i class="bi bi-currency-dollar"></i> ${j.salary || 'Not Disclosed'}</span>
                    <span><i class="bi bi-clock"></i> 2d ago • Full-time</span>
                  </div>
                  <div class="jc-btn">Apply Now <i class="bi bi-arrow-right"></i></div>
                </a>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p style="color: #ef4444; text-align: center; width: 100%;">Error loading featured jobs.</p>';
        }
    } catch(err) {
        console.error("Error fetching featured jobs:", err);
        grid.innerHTML = '<p style="color: #ef4444; text-align: center; width: 100%;">Error loading featured jobs.</p>';
    }
}

function setupHeroSearch() {
    const searchBtn = document.getElementById('heroSearchBtn');
    if (!searchBtn) return;
    
    searchBtn.addEventListener('click', () => {
        // Find inputs relatively by assuming their order or class
        const inputs = document.querySelectorAll('.hero-search input');
        let keywordContext = '';
        let locationContext = '';
        
        if (inputs.length >= 2) {
            keywordContext = inputs[0].value.trim();
            locationContext = inputs[1].value.trim();
        }
        
        // We could pass these as query parameters to jobs.html if jobs.html was configured to read and apply them
        // For now, redirect to jobs.html
        window.location.href = `pages/jobs/jobs.html?keyword=${encodeURIComponent(keywordContext)}&location=${encodeURIComponent(locationContext)}`;
    });
}
