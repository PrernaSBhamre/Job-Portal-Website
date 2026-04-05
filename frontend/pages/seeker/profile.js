let session = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || (session.user.role || '').toLowerCase() !== 'student') {
        window.location.href = '../auth/login.html';
        return;
    }

    fetchProfile();
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

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
            
            // Update Header
            document.getElementById('displayName').innerText = data.fullname || 'Professional Seeker';
            document.getElementById('displayBio').innerText = data.profile?.bio || 'No bio provided yet.';
            
            // Set Initials
            const initials = data.fullname
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            document.getElementById('avatarBox').innerText = initials || '??';

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
    const btn = document.getElementById('saveProfileBtn');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Synchronizing...';
    btn.disabled = true;
    
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
            
            // Update UI
            document.getElementById('displayName').innerText = data.fullname;
            document.getElementById('displayBio').innerText = data.profile?.bio || 'No bio provided yet.';
            
            // Update session storage
            session.user.fullname = data.fullname;
            localStorage.setItem('user', JSON.stringify(session.user));
            
            alert('Your professional identity has been synchronized successfully.');
            
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
    } finally {
        btn.innerHTML = 'Synchronize Professional Identity';
        btn.disabled = false;
    }
}
