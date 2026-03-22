document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId || jobId === 'undefined' || jobId === 'null' || jobId.trim() === '') {
        document.getElementById('loadingArea').innerHTML = `
            <div style="text-align:center; padding: 100px 0; color: #ef4444;">
                <p>Job ID is missing or invalid. Please go back and select a valid job.</p>
                <a href="jobs.html" class="btn btn-outline-light mt-3">Find Jobs</a>
            </div>
        `;
        return;
    }

    fetchJobDetails(jobId);
    setupAuthNav();
});

let currentJob = null;

async function fetchJobDetails(id) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/jobs/${id}`);
        if (!res.ok) throw new Error('Failed to fetch job');
        const job = await res.json();
        currentJob = job;
        renderJobDetails(job);
    } catch (err) {
        console.error(err);
        document.getElementById('loadingArea').innerHTML = `
            <div style="text-align:center; padding: 100px 0; color: #ef4444;">
                <p>Failed to load Job Details. The job may have been removed.</p>
                <a href="jobs.html" class="btn btn-outline-light mt-3">Find Jobs</a>
            </div>
        `;
    }
}

function renderJobDetails(job) {
    // Hide loading
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('jobArea').style.display = 'block';

    // Top Card
    document.getElementById('jdTitle').textContent = job.title;
    
    let compName = 'Unknown Company';
    let compIni = 'U';
    if (job.company && job.company.name) {
        compName = job.company.name;
        compIni = compName.substring(0,2).toUpperCase();
    }
    
    document.getElementById('jdCompany').textContent = compName;
    document.getElementById('jdInitial').textContent = compIni;
    document.getElementById('jdLoc').textContent = job.location || 'Remote';
    
    document.getElementById('jdSal').textContent = job.salary || 'Not Disclosed';
    document.getElementById('jdExp').textContent = job.experienceLevel || 'Fresher';
    document.getElementById('jdType').textContent = job.jobType || 'Full Time';

    if (job.description) {
        document.getElementById('jdDesc').textContent = job.description;
    }
    
    // Requirements (Checkmarks list)
    if (job.requirements) {
        // Simple split by newlines or formatting
        const reqs = job.requirements.split(/[\n,]+/).filter(x => x.trim() !== '');
        document.getElementById('jdReqs').innerHTML = reqs.map(r => `<li><i class="bi bi-check-circle-fill"></i> ${r.trim()}</li>`).join('');
    } else {
        document.getElementById('jdReqs').innerHTML = '<li><i class="bi bi-check-circle-fill"></i> Strong understanding of Javascript (ES6+)</li><li><i class="bi bi-check-circle-fill"></i> Basic knowledge of ' + job.title + ' principles</li><li><i class="bi bi-check-circle-fill"></i> Good problem solving skills</li>';
    }

    // Skills Tags
    const tags = job.tags && job.tags.length ? job.tags : ['JavaScript', 'HTML/CSS', 'Responsive Design'];
    document.getElementById('jdTags').innerHTML = tags.map(t => `<span class="jd-tag">${t}</span>`).join('');

    // Right Column Overview
    const posted = new Date(job.createdAt);
    const diffTime = Math.abs(new Date() - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('ovPosted').textContent = diffDays <= 1 ? 'Just now' : `${diffDays} days ago`;
    
    document.getElementById('ovApps').textContent = Math.floor(Math.random() * 200) + 10; // Dummy applicants metric
    document.getElementById('ovID').textContent = '#' + job._id.substring(job._id.length - 5).toUpperCase();

    // Bind Apply Buttons
    const btnApp1 = document.getElementById('btnQuickApply');
    const btnApp2 = document.getElementById('btnSideApply');
    const handleApply = () => submitApplication(job._id);
    
    btnApp1.onclick = handleApply;
    btnApp2.onclick = handleApply;
    
    document.getElementById('btnSaveJob').onclick = () => saveJobLocally(job._id);
}

async function submitApplication(jobId) {
    const session = getSession();
    if (!session || !session.token) {
        alert("You must be logged in as a Job Seeker to apply.");
        window.location.href = '../auth/login.html';
        return;
    }
    
    if (session.user.role !== 'student') {
        alert("Only Job Seekers (Freshers) can apply for jobs.");
        return;
    }

    // We don't have a specific file upload in this specialized UI, so we'll just send a default message or use Seeker's existing profile resume url.
    const formData = new FormData();
    formData.append('coverLetter', 'Applied via Quick Apply from Single Job View.');
    // If the Seeker already has a resume linked in their profile, backend could technically just read it.

    try {
        const btn = document.getElementById('btnQuickApply');
        const origText = btn.innerText;
        btn.innerText = 'Applying...';
        btn.disabled = true;

        const res = await fetch(`${CONFIG.API_URL}/applications/${jobId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.token}` } // Form boundary handles itself via form payload natively in vanilla JS but backend isn't expecting multipart unless configured
        });

        const data = await res.json();
        
        if (res.ok) {
            alert('Application Submitted Successfully!');
            btn.innerText = 'Applied!';
            btn.style.background = '#22c55e';
            document.getElementById('btnSideApply').innerText = 'Applied!';
            document.getElementById('btnSideApply').style.background = '#22c55e';
        } else {
            if (data.message && data.message.includes('Already applied')) {
                alert('You have already applied for this job!');
                btn.innerText = 'Already Applied';
            } else {
                alert(data.message || 'Failed to apply.');
                btn.innerText = origText;
                btn.disabled = false;
            }
        }
    } catch (e) {
        console.error(e);
        alert('An error occurred. Please try again later.');
    }
}

async function saveJobLocally(jobId) {
    const session = getSession();
    const btn = document.getElementById('btnSaveJob');
    if (!session || !session.token) {
        alert("Please login to save jobs.");
        return;
    }
    
    try {
        const res = await fetch(`${CONFIG.API_URL}/saved-jobs/${jobId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        if (res.ok) {
            btn.innerText = 'Saved!';
            btn.style.color = '#f97316';
            btn.style.borderColor = '#f97316';
        } else {
            const d = await res.json();
            if(d.message && d.message.includes("Already saved")) {
                btn.innerText = 'Already Saved';
            } else {
                alert(d.message || "Could not save.");
            }
        }
    } catch (e) {
        console.error(e);
    }
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
