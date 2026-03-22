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
                <button class="btn btn-sm btn-outline-light" style="border-color: var(--purple-light); color: #fff;" onclick="viewApplicants('${j._id}')">
                    View Applicants
                </button>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        document.getElementById('myJobsList').innerHTML = 'Error loading jobs.';
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

// 5. View Applicants for a Job
async function viewApplicants(jobId) {
    document.getElementById('myJobsTab').style.display = 'none';
    const panel = document.getElementById('applicantsPanel');
    panel.style.display = 'block';
    
    const list = document.getElementById('applicantsList');
    list.innerHTML = 'Loading applicants...';

    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/job/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (res.ok) {
            const apps = await res.json();
            if (apps.length === 0) {
                list.innerHTML = '<p class="text-muted">No applications yet.</p>';
                return;
            }

            list.innerHTML = apps.map(a => `
                <div class="p-3 mb-3" style="background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid var(--border);">
                    <div class="fw-bold text-white mb-1">${a.applicant?.fullname || 'Unknown User'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); mb-2">
                        <i class="bi bi-envelope"></i> ${a.applicant?.email || 'N/A'} • 
                        <i class="bi bi-telephone"></i> ${a.applicant?.phoneNumber || 'N/A'}
                    </div>
                    <div class="mt-2 text-capitalize" style="font-size: 0.85rem; font-weight: 600; color: ${a.status === 'pending' ? 'var(--orange)' : 'var(--purple-light)'}">
                        Status: ${a.status}
                    </div>
                </div>
            `).join('');

        } else {
            list.innerHTML = 'Failed to load applicants.';
        }
    } catch (err) {
        list.innerHTML = 'Error loading applicants.';
    }
}

function closeApplicants() {
    document.getElementById('applicantsPanel').style.display = 'none';
    document.getElementById('myJobsTab').style.display = 'block';
}
