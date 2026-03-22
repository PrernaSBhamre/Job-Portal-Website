document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId || jobId === 'undefined' || jobId === 'null' || jobId.trim() === '') {
        // Graceful fallback if opened directly without ID (loads the latest job for visual testing)
        console.warn("No specific Job ID provided via URL. Auto-fetching most recent featured job for UI preview...");
        fetchFallbackJob();
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

async function fetchFallbackJob() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch fallback jobs');
        const jobsList = await res.json();
        
        if (jobsList && jobsList.length > 0) {
            currentJob = jobsList[0];
            renderJobDetails(currentJob);
        } else {
            throw new Error('Database empty');
        }
    } catch (err) {
        document.getElementById('loadingArea').innerHTML = `
            <div style="text-align:center; padding: 100px 0; color: #ef4444;">
                <p>No active jobs available for preview.</p>
                <a href="../../index.html" class="btn btn-outline-light mt-3">Return Home</a>
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
        
        // Populate About Company Section dynamically
        if(job.company.description) {
            document.getElementById('jdCompDesc').textContent = job.company.description;
        }
        if(job.company.industry) document.getElementById('jdCompInd').textContent = job.company.industry;
        if(job.company.companySize) document.getElementById('jdCompSize').textContent = job.company.companySize;
        if(job.company.founded) document.getElementById('jdCompFound').textContent = job.company.founded;
        
        const webEl = document.getElementById('jdCompWeb');
        if(job.company.website) {
            webEl.href = job.company.website;
            webEl.style.display = 'inline-block';
        } else {
            webEl.style.display = 'none';
        }
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

    // Unstop Data Mapping
    const mapList = (data, elemId, hdrId, icon) => {
        const el = document.getElementById(elemId);
        const hdr = document.getElementById(hdrId);
        if (data && data.length > 0) {
            el.innerHTML = data.map(i => `<li><i class="${icon}"></i> ${i.trim()}</li>`).join('');
            hdr.style.display = 'block';
            el.style.display = 'block';
        } else {
            hdr.style.display = 'none';
            el.style.display = 'none';
        }
    };

    mapList(job.responsibilities, 'jdResp', 'hdrResp', 'bi bi-check2-circle');
    mapList(job.perks, 'jdPerks', 'hdrPerks', 'bi bi-star-fill');

    const elElig = document.getElementById('jdElig');
    const hdrElig = document.getElementById('hdrElig');
    if (job.eligibility) {
        elElig.textContent = job.eligibility;
        hdrElig.style.display = 'block';
        elElig.style.display = 'block';
    } else {
        hdrElig.style.display = 'none';
        elElig.style.display = 'none';
    }

    // Requirements (Checkmarks list)
    if (job.requirements && job.requirements.length > 0) {
        document.getElementById('jdReqs').innerHTML = job.requirements.map(r => `<li><i class="bi bi-shield-check" style="color:var(--purple);margin-right:8px;"></i> ${r.trim()}</li>`).join('');
    } else {
        document.getElementById('jdReqs').innerHTML = '<li><i class="bi bi-shield-check" style="color:var(--purple);margin-right:8px;"></i> Strong understanding of Javascript (ES6+)</li>';
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

    // Bind Apply Buttons to Unstop Modal
    const btnApp1 = document.getElementById('btnQuickApply');
    const btnApp2 = document.getElementById('btnSideApply');
    
    const triggerModal = () => {
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

        // Hydrate Modal Target Details
        document.getElementById('modalJobTitle').textContent = job.title;
        let cName = 'Unknown Company';
        if (job.company && job.company.name) cName = job.company.name;
        document.getElementById('modalCompName').textContent = cName;
        document.getElementById('modalCompInit').textContent = cName.substring(0,2).toUpperCase();
        
        // Setup initial user data if present
        if(session.user.fullname) document.getElementById('appyName').value = session.user.fullname;
        if(session.user.email) document.getElementById('appyEmail').value = session.user.email;

        // Show Bootstrap Modal
        const applyModal = new bootstrap.Modal(document.getElementById('applyModal'));
        applyModal.show();
    };
    
    btnApp1.onclick = triggerModal;
    btnApp2.onclick = triggerModal;
    
    document.getElementById('btnSaveJob').onclick = () => saveJobLocally(job._id);

    // Bind File Input listener
    const fileInp = document.getElementById('appyResumeFile');
    fileInp.addEventListener('change', function() {
        const display = document.getElementById('fileSelectedDisplay');
        if (this.files && this.files.length > 0) {
            display.textContent = 'Selected: ' + this.files[0].name;
            display.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    });

    // Bind Modal Form Submit
    document.getElementById('applyForm').onsubmit = (e) => {
        e.preventDefault();
        submitApplication(job._id);
    };
}

async function submitApplication(jobId) {
    const session = getSession();
    
    // Grab all explicit fields
    const nameVal = document.getElementById('appyName').value;
    const phoneVal = document.getElementById('appyPhone').value;
    const emailVal = document.getElementById('appyEmail').value;
    const colVal = document.getElementById('appyCollege').value;
    const gradVal = document.getElementById('appyGradYear').value;
    const portVal = document.getElementById('appyPortfolio').value;
    const coverVal = document.getElementById('appyCover').value;
    const fileInp = document.getElementById('appyResumeFile');

    if (!fileInp.files || fileInp.files.length === 0) {
        alert("Please attach your resume file.");
        return;
    }

    const formData = new FormData();
    formData.append('fullName', nameVal);
    formData.append('phone', phoneVal);
    formData.append('email', emailVal);
    formData.append('college', colVal);
    formData.append('graduationYear', gradVal);
    formData.append('portfolio', portVal);
    formData.append('coverLetter', coverVal);
    formData.append('resume', fileInp.files[0]);

    try {
        const btn = document.getElementById('modalFinalApplyBtn');
        btn.innerText = 'Submitting...';
        btn.disabled = true;

        const res = await fetch(`${CONFIG.API_URL}/applications/job/${jobId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${session.token}`
            },
            body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
            alert('Application Submitted Successfully!');
            
            // Hide modal
            const applyModalEl = document.getElementById('applyModal');
            const modal = bootstrap.Modal.getInstance(applyModalEl);
            modal.hide();

            // Update UI Buttons
            const btnApp1 = document.getElementById('btnQuickApply');
            const btnApp2 = document.getElementById('btnSideApply');
            btnApp1.innerText = 'Applied!';
            btnApp1.style.background = '#22c55e';
            btnApp1.onclick = null;
            btnApp2.innerText = 'Applied!';
            btnApp2.style.background = '#22c55e';
            btnApp2.onclick = null;
        } else {
            if (data.message && data.message.includes('Already applied')) {
                alert('You have already applied for this job!');
                const applyModalEl = document.getElementById('applyModal');
                bootstrap.Modal.getInstance(applyModalEl).hide();
                document.getElementById('btnQuickApply').innerText = 'Already Applied';
                document.getElementById('btnSideApply').innerText = 'Already Applied';
            } else {
                alert(data.message || 'Failed to apply.');
                btn.innerText = 'Submit Application';
                btn.disabled = false;
            }
        }
    } catch(e) {
        console.error("Apply Error:", e);
        alert("An error occurred during submission.");
        const failBtn = document.getElementById('modalFinalApplyBtn');
        if(failBtn) {
            failBtn.innerText = 'Submit Application';
            failBtn.disabled = false;
        }
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
