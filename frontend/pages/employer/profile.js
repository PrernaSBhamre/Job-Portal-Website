let session = null;

document.addEventListener('DOMContentLoaded', () => {
    session = getSession();
    if (!session || (session.user.role || '').toLowerCase() !== 'recruiter') {
        window.location.href = '../auth/login.html';
        return;
    }

    fetchRecruiterProfile();
    fetchCompanyProfile();

    document.getElementById('recruiterForm').addEventListener('submit', updateRecruiterProfile);
    document.getElementById('companyForm').addEventListener('submit', updateCompanyProfile);
    document.getElementById('saveDescBtn').addEventListener('click', updateCompanyProfile); // Narrative uses the same update
});

// 1. Fetch Recruiter Personal Profile
async function fetchRecruiterProfile() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // Update Header
            document.getElementById('displayName').innerText = data.fullname || 'Recruiter';
            document.getElementById('displayBio').innerText = data.profile?.bio || 'Talent Acquisition Professional';
            
            // Set Initials
            const initials = data.fullname
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            document.getElementById('avatarBox').innerText = initials || '??';

            // Fill Form
            document.getElementById('rName').value = data.fullname || '';
            document.getElementById('rTitle').value = data.profile?.bio || ''; // Reusing bio for title/designation in this case
            document.getElementById('rPhone').value = data.phoneNumber || '';
        }
    } catch (err) {
        console.error("Error fetching recruiter profile:", err);
    }
}

// 2. Fetch Company Profile
async function fetchCompanyProfile() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/recruiter/company`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.company) {
                const c = data.company;
                document.getElementById('cName').value = c.name || '';
                document.getElementById('cWeb').value = c.website || '';
                document.getElementById('cLoc').value = c.location || '';
                document.getElementById('cDesc').value = c.description || '';
            }
        }
    } catch (err) {
        console.error("Error fetching company profile:", err);
    }
}

// 3. Update Recruiter Profile
async function updateRecruiterProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('saveRecruiterBtn');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Syncing...';
    btn.disabled = true;

    try {
        const payload = {
            fullname: document.getElementById('rName').value.trim(),
            phoneNumber: document.getElementById('rPhone').value.trim(),
            profile: {
                bio: document.getElementById('rTitle').value.trim()
            }
        };

        const res = await fetch(`${CONFIG.API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Your professional identity has been updated.');
            fetchRecruiterProfile(); // Refresh header
        } else {
            const errData = await res.json();
            alert(errData.message || 'Update failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error.');
    } finally {
        btn.innerHTML = 'Update Identity';
        btn.disabled = false;
    }
}

// 4. Update Company Profile
async function updateCompanyProfile(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    const isDescOnly = (e?.target?.id === 'saveDescBtn');
    const btn = isDescOnly ? document.getElementById('saveDescBtn') : document.getElementById('saveCompanyBtn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Syncing...';
    btn.disabled = true;

    try {
        const payload = {
            name: document.getElementById('cName').value.trim(),
            website: document.getElementById('cWeb').value.trim(),
            location: document.getElementById('cLoc').value.trim(),
            description: document.getElementById('cDesc').value.trim()
        };

        const res = await fetch(`${CONFIG.API_URL}/recruiter/company`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Company profile synchronized successfully.');
        } else {
            const errData = await res.json();
            alert(errData.message || 'Failed to update company');
        }
    } catch (err) {
        console.error(err);
        alert('Server error.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
