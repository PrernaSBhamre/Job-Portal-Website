let session = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || session.user.role !== 'student') {
        alert('Access denied. Job Seekers only.');
        window.location.href = '../auth/login.html';
        return;
    }

    fetchProfile();
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

// Switch Tab logic
function switchTab(tabId, btn) {
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => link.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('profileTab').style.display = 'none';
    document.getElementById('applicationsTab').style.display = 'none';

    document.getElementById(tabId + 'Tab').style.display = 'block';

    if(tabId === 'applications') {
        fetchMyApps();
    }
}

// 1. Fetch User Profile
async function fetchProfile() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // Pre-fill form
            document.getElementById('pName').value = data.fullname || '';
            document.getElementById('pPhone').value = data.phoneNumber || '';
            
            if (data.profile) {
                document.getElementById('pBio').value = data.profile.bio || '';
                document.getElementById('pSkills').value = data.profile.skills ? data.profile.skills.join(', ') : '';
                
                if (data.profile.socialLinks) {
                    document.getElementById('pLinkedIn').value = data.profile.socialLinks.linkedIn || '';
                    document.getElementById('pGithub').value = data.profile.socialLinks.github || '';
                    document.getElementById('pPortfolio').value = data.profile.socialLinks.portfolio || '';
                }
                
                if (data.profile.preferences) {
                    document.getElementById('pSalary').value = data.profile.preferences.expectedSalary || '';
                    document.getElementById('pRelocate').checked = data.profile.preferences.willingnessToRelocate || false;
                }
                
                if (data.profile.resume) {
                    document.getElementById('pResume').value = data.profile.resume;
                    document.getElementById('currentResumeBox').style.display = 'flex';
                    document.getElementById('currentResumeLink').href = data.profile.resume;
                }
                
                if (data.profile.experience && data.profile.experience.length > 0) {
                    const exp = data.profile.experience[0];
                    document.getElementById('pExpCompany').value = exp.company || '';
                    document.getElementById('pExpTitle').value = exp.title || '';
                    document.getElementById('pExpStart').value = exp.startDate || '';
                    document.getElementById('pExpEnd').value = exp.endDate || '';
                }

                if (data.profile.education && data.profile.education.length > 0) {
                    const edu = data.profile.education[0];
                    document.getElementById('pEduInst').value = edu.institution || '';
                    document.getElementById('pEduDegree').value = edu.degree || '';
                    document.getElementById('pEduYear').value = edu.endYear || '';
                    document.getElementById('pEduGrade').value = edu.grade || '';
                }
            }
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    }
}

// 2. Update Profile
async function updateProfile(e) {
    e.preventDefault();
    
    // Convert comma tags to array
    const skillsArr = document.getElementById('pSkills').value.split(',').map(s => s.trim()).filter(s => s);
    const resumeUrl = document.getElementById('pResume').value.trim();

    const payload = {
        fullname: document.getElementById('pName').value.trim(),
        phoneNumber: document.getElementById('pPhone').value.trim(),
        profile: {
            bio: document.getElementById('pBio').value.trim(),
            skills: skillsArr,
            resume: resumeUrl,
            socialLinks: {
                linkedIn: document.getElementById('pLinkedIn').value.trim(),
                github: document.getElementById('pGithub').value.trim(),
                portfolio: document.getElementById('pPortfolio').value.trim()
            },
            preferences: {
                expectedSalary: document.getElementById('pSalary').value.trim(),
                willingnessToRelocate: document.getElementById('pRelocate').checked
            },
            experience: [{
                company: document.getElementById('pExpCompany').value.trim(),
                title: document.getElementById('pExpTitle').value.trim(),
                startDate: document.getElementById('pExpStart').value.trim(),
                endDate: document.getElementById('pExpEnd').value.trim(),
            }],
            education: [{
                institution: document.getElementById('pEduInst').value.trim(),
                degree: document.getElementById('pEduDegree').value.trim(),
                endYear: document.getElementById('pEduYear').value.trim(),
                grade: document.getElementById('pEduGrade').value.trim(),
            }]
        }
    };

    try {
        const res = await fetch(`${CONFIG.API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            
            // Update session storage details just in case
            session.user.fullname = data.fullname;
            localStorage.setItem('user', JSON.stringify(session.user));
            
            // Update the navbar name
            const proBtn = document.getElementById('navProfileBtn');
            if (proBtn) proBtn.innerHTML = `<i class="bi bi-person-circle"></i> ${data.fullname}`;

            alert('Profile updated successfully!');
            
            if (resumeUrl) {
                document.getElementById('currentResumeBox').style.display = 'flex';
                document.getElementById('currentResumeLink').href = resumeUrl;
            }
        } else {
            const errData = await res.json();
            alert(errData.message || 'Failed to update profile');
        }
    } catch(err) {
        console.error(err);
        alert('Server error while saving profile.');
    }
}

// 3. Fetch My Applications
async function fetchMyApps() {
    const list = document.getElementById('myAppsList');
    list.innerHTML = 'Loading...';

    try {
        const res = await fetch(`${CONFIG.API_URL}/applications/user`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (res.ok) {
            const apps = await res.json();
            
            if (apps.length === 0) {
                list.innerHTML = '<p class="text-muted">You have not applied to any jobs yet. <a href="../jobs/jobs.html" style="color:var(--purple-light);">Find jobs here!</a></p>';
                return;
            }

            list.innerHTML = apps.map(a => {
                const jobTitle = a.job?.title || 'Unknown Job';
                const coName = a.job?.company?.name || 'Unknown Company';
                const appDate = new Date(a.createdAt).toLocaleDateString();
                
                return `
                <div class="app-card">
                    <div>
                        <div class="app-title">${jobTitle}</div>
                        <div class="app-co">${coName} • Applied: ${appDate}</div>
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

// 4. Withdraw Application
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
