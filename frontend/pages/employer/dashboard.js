let session = null;
let companyId = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || session.user.role !== 'recruiter') {
        alert('Access denied. Employers only.');
        window.location.href = '../auth/login.html';
        return;
    }

    checkCompany();

    document.getElementById('companyForm').addEventListener('submit', createCompany);
    document.getElementById('postJobForm').addEventListener('submit', createJob);
});

// Switch Tab logic
function switchTab(tabId, btn) {
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => link.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('myJobsTab').style.display = 'none';
    document.getElementById('postJobTab').style.display = 'none';
    document.getElementById('applicantsPanel').style.display = 'none';

    document.getElementById(tabId + 'Tab').style.display = 'block';

    if(tabId === 'myJobs') {
        fetchMyJobs();
    }
}

// 1. Fetch Companies to see if this user has one
async function checkCompany() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/companies`);
        const companies = await res.json();
        
        // Find company where userId matches the session user
        const myCompany = companies.find(c => c.userId === session.user._id);

        if (myCompany) {
            companyId = myCompany._id;
            document.getElementById('companySetupPanel').style.display = 'none';
            document.getElementById('dashboardTabs').style.display = 'block';
            fetchMyJobs();
        } else {
            // Must create company first
            document.getElementById('companySetupPanel').style.display = 'block';
            document.getElementById('dashboardTabs').style.display = 'none';
        }
    } catch (err) {
        console.error("Error fetching companies:", err);
    }
}

// 2. Create Company
async function createCompany(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('cName').value.trim(),
        website: document.getElementById('cWeb').value.trim(),
        location: document.getElementById('cLoc').value.trim(),
        description: document.getElementById('cDesc').value.trim()
    };

    try {
        const res = await fetch(`${CONFIG.API_URL}/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            companyId = data._id;
            document.getElementById('companySetupPanel').style.display = 'none';
            document.getElementById('dashboardTabs').style.display = 'block';
            fetchMyJobs();
        } else {
            const errData = await res.json();
            alert(errData.message || 'Failed to create company');
        }
    } catch(err) {
        console.error(err);
        alert('Server error.');
    }
}

// 3. Fetch recruiter's jobs
async function fetchMyJobs() {
    document.getElementById('myJobsList').innerHTML = 'Loading...';
    try {
        const res = await fetch(`${CONFIG.API_URL}/jobs`);
        const jobs = await res.json();
        const myJobs = jobs.filter(j => j.created_by === session.user._id);

        if (myJobs.length === 0) {
            document.getElementById('myJobsList').innerHTML = '<p class="text-muted">You have not posted any jobs yet.</p>';
            return;
        }

        document.getElementById('myJobsList').innerHTML = myJobs.map(j => `
            <div class="job-list-item">
                <div>
                    <div class="j-title">${j.title} <span class="badge bg-secondary ms-2">${j.applications ? j.applications.length : 0} Applicants</span></div>
                    <div class="j-meta">${j.location} • ${j.jobType} • ${j.salary}</div>
                </div>
                <div class="d-flex gap-2 mt-2">
                    <button class="btn btn-sm btn-outline-light" style="border-color: var(--purple-light); color: #fff;" onclick="viewApplicants('${j._id}')">
                        View Applicants
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete Job" onclick="deleteJob('${j._id}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        document.getElementById('myJobsList').innerHTML = 'Error loading jobs.';
    }
}

// 5. Delete Job
async function deleteJob(jobId) {
    if (!confirm("Are you sure you want to permanently delete this job? This will explicitly remove all associated applications.")) return;
    
    try {
        const res = await fetch(`${CONFIG.API_URL}/jobs/${jobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (res.ok) {
            alert("Job deleted successfully.");
            fetchMyJobs(); // Refresh the layout
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete job.");
        }
    } catch(err) {
        console.error(err);
        alert("Server error during deletion.");
    }
}

// 4. Create Job
async function createJob(e) {
    e.preventDefault();
    
    // Convert comma tags to array
    const tagsArr = document.getElementById('jTags').value.split(',').map(t => t.trim()).filter(t => t);
    const reqArr = document.getElementById('jReq').value.split('\n').filter(r => r.trim());

    if(reqArr.length === 0) reqArr.push('Standard Requirements Apply');

    const payload = {
        title: document.getElementById('jTitle').value.trim(),
        description: document.getElementById('jDesc').value.trim(),
        requirements: reqArr,
        salary: document.getElementById('jSal').value.trim(),
        experienceLevel: document.getElementById('jExp').value.trim() || 'Fresher',
        location: document.getElementById('jLoc').value.trim(),
        jobType: document.getElementById('jType').value,
        position: 1, // Default 1
        tags: tagsArr,
        company: companyId
    };

    try {
        const res = await fetch(`${CONFIG.API_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Job posted successfully!');
            document.getElementById('postJobForm').reset();
            // Switch to my jobs tab
            document.querySelector('.nav-tabs .nav-link').click(); // First tab
        } else {
            const errData = await res.json();
            alert(errData.message || 'Failed to post job');
        }
    } catch(err) {
        console.error(err);
        alert('Server error while posting job.');
    }
}

// 5. View Applicants for a Job (Kanban Board)
async function viewApplicants(jobId) {
    document.getElementById('myJobsTab').style.display = 'none';
    const panel = document.getElementById('applicantsPanel');
    panel.style.display = 'block';
    
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = '<p class="text-white">Loading ATS Pipeline...</p>';

    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/job/${jobId}`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (res.ok) {
            const apps = await res.json();
            
            const cols = {
                'pending': '', 'shortlisted': '', 'interviewing': '', 'offered': '', 'rejected': ''
            };

            apps.forEach(a => {
                const stat = a.status.toLowerCase();
                const sel = `
                    <select class="action-select" onchange="updateAppStatus('${a._id}', this.value, '${jobId}')">
                        <option value="pending" ${stat==='pending'?'selected':''}>Pending</option>
                        <option value="shortlisted" ${stat==='shortlisted'?'selected':''}>Shortlisted</option>
                        <option value="interviewing" ${stat==='interviewing'?'selected':''}>Interviewing</option>
                        <option value="offered" ${stat==='offered'?'selected':''}>Offered</option>
                        <option value="rejected" ${stat==='rejected'?'selected':''}>Rejected</option>
                    </select>
                `;
                
                let cardHTML = `
                    <div class="kanban-card">
                        <h5>${a.applicant?.fullname || 'Unknown User'}</h5>
                        <p><i class="bi bi-envelope"></i> ${a.applicant?.email || 'N/A'}<br/>
                           <i class="bi bi-telephone"></i> ${a.applicant?.phoneNumber || 'N/A'}</p>
                        ${sel}
                    </div>
                `;
                if(cols[stat] !== undefined) cols[stat] += cardHTML;
            });

            board.innerHTML = `
                <div class="kanban-col"><div class="kanban-header">Applied (${(cols.pending.match(/<div class="kanban-card"/g)||[]).length})</div>${cols.pending}</div>
                <div class="kanban-col"><div class="kanban-header text-primary">Shortlisted (${(cols.shortlisted.match(/<div class="kanban-card"/g)||[]).length})</div>${cols.shortlisted}</div>
                <div class="kanban-col"><div class="kanban-header text-warning">Interviewing (${(cols.interviewing.match(/<div class="kanban-card"/g)||[]).length})</div>${cols.interviewing}</div>
                <div class="kanban-col"><div class="kanban-header text-success">Offered (${(cols.offered.match(/<div class="kanban-card"/g)||[]).length})</div>${cols.offered}</div>
                <div class="kanban-col"><div class="kanban-header text-danger">Rejected (${(cols.rejected.match(/<div class="kanban-card"/g)||[]).length})</div>${cols.rejected}</div>
            `;
        } else {
            board.innerHTML = '<p class="text-white">Failed to load ATS Pipeline.</p>';
        }
    } catch (err) {
        board.innerHTML = '<p class="text-danger">Error loading applicants.</p>';
    }
}

// Update Applicant Status
async function updateAppStatus(appId, newStatus, jobId) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/${appId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if(res.ok) {
            // Re-render the board silently to snap the card to the new column
            viewApplicants(jobId);
        } else {
            alert('Failed to move applicant pipeline status.');
        }
    } catch(err) {
        console.error(err);
        alert('Server Error.');
    }
}

function closeApplicants() {
    document.getElementById('applicantsPanel').style.display = 'none';
    document.getElementById('myJobsTab').style.display = 'block';
}
