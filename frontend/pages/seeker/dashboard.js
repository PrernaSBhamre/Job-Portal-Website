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
                
                if (data.profile.resume) {
                    document.getElementById('pResume').value = data.profile.resume;
                    document.getElementById('currentResumeBox').style.display = 'flex';
                    document.getElementById('currentResumeLink').href = data.profile.resume;
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
            resume: resumeUrl
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
                    <div class="app-status status-${a.status.toLowerCase()}">${a.status}</div>
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
