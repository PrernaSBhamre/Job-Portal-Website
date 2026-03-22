document.addEventListener('DOMContentLoaded', () => {
    fetchResources();
    
    // Category click listener
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.addEventListener('click', (e) => {
            document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
            const cat = e.target.innerText;
            e.target.classList.add('active');
            filterResources(cat);
        });
    });

    // Search bar listener
    const searchInput = document.querySelector(".top-search input");
    if(searchInput) {
        searchInput.addEventListener("keyup", function () {
            const val = this.value.toLowerCase();
            const filtered = allResources.filter(r => 
                r.title.toLowerCase().includes(val) || 
                r.content.toLowerCase().includes(val) ||
                r.category.toLowerCase().includes(val)
            );
            renderResources(filtered);
        });
    }
});

let allResources = [];

async function fetchResources() {
    const container = document.getElementById('resourceContainer');
    container.innerHTML = '<p class="text-center text-muted w-100 mt-5">Loading resources...</p>';
    
    try {
        const res = await fetch(`${CONFIG.API_URL}/resources`);
        if (res.ok) {
            allResources = await res.json();
            renderResources(allResources);
        } else {
            container.innerHTML = '<p class="text-center text-danger w-100 mt-5">Failed to fetch resources.</p>';
        }
    } catch (error) {
        console.error("Error fetching resources:", error);
        container.innerHTML = '<p class="text-center text-danger w-100 mt-5">Error communicating with server.</p>';
    }
}

function renderResources(resources) {
    const container = document.getElementById('resourceContainer');
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="text-center text-muted w-100 mt-5">No resources match your search.</p>';
        return;
    }
    
    container.innerHTML = resources.map(r => `
        <div class="resource-item" data-category="${r.category.toLowerCase()}" style="display:flex;">
            <img src="${r.imageUrl || 'https://via.placeholder.com/120x120'}" alt="${r.title}">
            <div class="details">
                <span class="badge free" style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">${r.category.toUpperCase()}</span>
                <span style="font-size: 0.8rem; color: #94a3b8; margin-left: 10px;"><i class="bi bi-clock"></i> ${r.readTime}</span>
                <h3 style="margin-top: 10px">${r.title}</h3>
                <p>${r.content.substring(0, 100)}${r.content.length > 100 ? '...' : ''}</p>
                <div class="meta" style="margin-top: 15px">
                    <span>By ${r.author}</span>
                </div>
                <button class="download-btn" onclick="openResource('${r._id}')">Read Full Article</button>
            </div>
        </div>
    `).join('');
}

function filterResources(category) {
    if (category === 'All Resources') {
        renderResources(allResources);
        return;
    }
    const filtered = allResources.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
    renderResources(filtered);
}

function openResource(id) {
    const session = getSession();
    if (!session || !session.token) {
        alert("Please login to create an account to read premium resources.");
        window.location.href = '../auth/login.html';
        return;
    }
    
    // Find the resource from allResources array
    const article = allResources.find(r => r._id === id);
    if(!article) {
        alert("Error loading article contents.");
        return;
    }
    
    // Populate Modal
    document.getElementById('articleModalLabel').innerText = article.title;
    
    const bodyHTML = `
        ${article.imageUrl ? `<img src="${article.imageUrl}" style="width:100%; height:auto; border-radius:12px; margin-bottom: 20px;" alt="...">` : ''}
        <div class="d-flex align-items-center gap-3 mb-4">
            <span class="badge bg-primary">${article.category}</span>
            <span class="text-muted small"><i class="bi bi-clock"></i> ${article.readTime}</span>
            <span class="text-muted small"><i class="bi bi-person"></i> By ${article.author}</span>
        </div>
        <div style="line-height: 1.8; font-size: 1.05rem; white-space: pre-wrap;">${article.content}</div>
    `;
    
    document.getElementById('articleModalBody').innerHTML = bodyHTML;
    
    // Show Modal
    const myModal = new bootstrap.Modal(document.getElementById('articleModal'));
    myModal.show();
}
