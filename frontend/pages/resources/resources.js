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
        container.innerHTML = '<div style="grid-column: 1/-1"><p class="text-center text-muted mt-5 fw-bold"><i class="bi bi-search fs-1 d-block mb-3"></i>No resources match your precise query.</p></div>';
        return;
    }
    
    container.innerHTML = resources.map(r => {
        const fallImg = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop';
        const ini = r.author ? r.author.charAt(0).toUpperCase() : 'A';
        
        return `
        <article class="res-card" data-category="${r.category.toLowerCase()}">
            <div class="res-img-box">
                <img src="${r.imageUrl || fallImg}" alt="${r.title}">
                <div class="res-badge">${r.category}</div>
            </div>
            <div class="res-body">
                <div class="res-meta">
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-clock"></i> ${r.readTime || '5 min read'}</div>
                    <div class="d-flex align-items-center gap-2"><i class="bi bi-star-fill text-warning"></i> 4.9 Premium</div>
                </div>
                <h3 class="res-title">${r.title}</h3>
                <p class="res-desc">${r.content.substring(0, 120)}${r.content.length > 120 ? '...' : ''}</p>
                
                <div class="res-footer">
                    <div class="res-author">
                        <div class="res-author-av">${ini}</div>
                        ${r.author || 'Admin'}
                    </div>
                    <button class="btn-read" onclick="openResource('${r._id}')">Read <i class="bi bi-arrow-right"></i></button>
                </div>
            </div>
        </article>
        `;
    }).join('');
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
