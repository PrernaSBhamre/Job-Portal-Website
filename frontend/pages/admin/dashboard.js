let session = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || session.user.role !== 'admin') {
        alert('Access denied. Administrators only.');
        window.location.href = '../../index.html';
        return;
    }

    // Default load
    fetchUsers();
});

function switchTab(tabId, btn) {
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => link.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('usersTab').style.display = 'none';
    document.getElementById('jobsTab').style.display = 'none';
    document.getElementById('dashboardTab').style.display = 'none';

    document.getElementById(tabId + 'Tab').style.display = 'block';

    if(tabId === 'users') fetchUsers();
    else if(tabId === 'jobs') fetchJobs();
    else if(tabId === 'dashboard') loadStats();
}

async function fetchUsers() {
    const list = document.getElementById('usersList');
    list.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch(`${CONFIG.API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if(res.ok) {
            const users = await res.json();
            if(users.length === 0) { list.innerHTML = '<tr><td colspan="4" class="text-center">No users found.</td></tr>'; return; }
            
            list.innerHTML = users.map(u => `
                <tr>
                    <td><strong>${u.fullname}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : (u.role==='recruiter' ? 'bg-primary' : 'bg-secondary')}">${u.role.toUpperCase()}</span></td>
                    <td>
                        <button class="btn-danger-outline" onclick="deleteUser('${u._id}')">Remove</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(err) {
        list.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading users.</td></tr>';
    }
}

async function deleteUser(id) {
    if(!confirm("Are you sure you want to delete this user completely?")) return;
    try {
        const res = await fetch(`${CONFIG.API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if(res.ok) {
            alert('User deleted.');
            fetchUsers();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete");
        }
    } catch(err) {
        alert('Server error.');
    }
}

async function fetchJobs() {
    const list = document.getElementById('jobsList');
    list.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

    try {
        const res = await fetch(`${CONFIG.API_URL}/admin/jobs`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if(res.ok) {
            const jobs = await res.json();
            if(jobs.length === 0) { list.innerHTML = '<tr><td colspan="4" class="text-center">No jobs found.</td></tr>'; return; }
            
            list.innerHTML = jobs.map(j => `
                <tr>
                    <td><strong>${j.title}</strong></td>
                    <td>${j.company?.name || 'N/A'}</td>
                    <td>${j.created_by?.email || 'N/A'}</td>
                    <td>
                        <button class="btn-danger-outline" onclick="deleteJob('${j._id}')">Remove</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch(err) {
        list.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading jobs.</td></tr>';
    }
}

async function deleteJob(id) {
    if(!confirm("Are you sure you want to delete this job?")) return;
    try {
        const res = await fetch(`${CONFIG.API_URL}/admin/jobs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if(res.ok) {
            alert('Job deleted.');
            fetchJobs();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete");
        }
    } catch(err) {
        alert('Server error.');
    }
}

async function loadStats() {
    try {
        const hHeaders = { 'Authorization': `Bearer ${session.token}` };
        
        let usersC = 0, jobsC = 0, appsC = 0;
        
        const [uRes, jRes, aRes] = await Promise.all([
            fetch(`${CONFIG.API_URL}/admin/users`, { headers: hHeaders }),
            fetch(`${CONFIG.API_URL}/admin/jobs`, { headers: hHeaders }),
            fetch(`${CONFIG.API_URL}/admin/applications`, { headers: hHeaders })
        ]);
        
        if(uRes.ok) usersC = (await uRes.json()).length;
        if(jRes.ok) jobsC = (await jRes.json()).length;
        if(aRes.ok) appsC = (await aRes.json()).length;
        
        document.getElementById('statUsers').innerText = usersC;
        document.getElementById('statJobs').innerText = jobsC;
        document.getElementById('statApps').innerText = appsC;

    } catch(err) { console.error("Error loading stats", err); }
}
