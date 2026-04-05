let session = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || (session.user.role || '').toLowerCase() !== 'student') {
        window.location.href = '../auth/login.html';
        return;
    }

    fetchMyApps();
});

// 1. Fetch My Applications
async function fetchMyApps() {
    const list = document.getElementById('myAppsList');
    list.innerHTML = `
        <div class="text-center py-5">
            <span class="spinner-border text-violet"></span>
            <p class="mt-3 text-zinc-500">Retrieving active applications...</p>
        </div>
    `;

    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/user`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (res.ok) {
            const apps = await res.json();
            
            if (apps.length === 0) {
                list.innerHTML = '<p class="text-muted">You have not applied to any jobs yet. <a href="../jobs/jobs.html" style="color:var(--violet);">Find jobs here!</a></p>';
                return;
            }

            list.innerHTML = apps.map(a => {
                const jobTitle = a.job?.title || 'Unknown Job';
                const coName = a.job?.company?.name || 'Unknown Company';
                const appDate = new Date(a.createdAt).toLocaleDateString();
                
                return `
                <div class="app-card">
                    <div class="app-main">
                        <div class="app-icon"><i class="bi bi-briefcase"></i></div>
                        <div>
                            <div class="app-title">${jobTitle}</div>
                            <div class="app-co">${coName} • Applied: ${appDate}</div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="app-status status-${a.status.toLowerCase()}">${a.status}</div>
                        <button onclick="withdrawApplication('${a._id}')" class="btn btn-sm btn-outline-danger" title="Withdraw Application"><i class="bi bi-trash3"></i></button>
                    </div>
                </div>
                `;
            }).join('');

        } else {
            list.innerHTML = '<p class="text-danger">Failed to load applications.</p>';
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p class="text-danger">Error connecting to server.</p>';
    }
}

// 2. Withdraw Application
async function withdrawApplication(appId) {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/${appId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (res.ok) {
            alert("Application withdrawn successfully.");
            fetchMyApps(); // Refresh the list
        } else {
            const data = await res.json();
            alert(data.message || "Failed to withdraw application.");
        }
    } catch(err) {
        console.error(err);
        alert("Server error during withdrawal.");
    }
}
