// Hamburger Menu
function toggleMenu(){
    const nav = document.getElementById("navLinks");
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}

// Search Filter
document.querySelector(".search-section button").addEventListener("click", function(){
    let input = document.querySelector(".search-section input").value.toLowerCase();
    let cards = document.querySelectorAll(".service-card");

    cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        card.style.display = text.includes(input) ? "block" : "none";
    });
});

// Category Filter
document.querySelectorAll(".categories button").forEach(button=>{
    button.addEventListener("click", function(){
        document.querySelectorAll(".categories button").forEach(btn=>btn.classList.remove("active"));
        this.classList.add("active");

        let category = this.innerText;
        let cards = document.querySelectorAll(".service-card");

        cards.forEach(card=>{
            if(category === "All"){
                card.style.display = "block";
            }
            else if(category === "Premium"){
                card.style.display = card.querySelector(".pro") ? "block" : "none";
            }
            else{
                card.style.display = card.closest(".services-section").querySelector("h2").innerText.includes(category) ? "block" : "none";
            }
        });
    });
});

// Dynamic Session Check for Buttons
document.addEventListener('DOMContentLoaded', () => {
    const session = getSession && typeof getSession === 'function' ? getSession() : null;
    let targetDash = '../auth/login.html';
    
    if (session && session.user) {
        if(session.user.role === 'recruiter') targetDash = '../employer/dashboard.html';
        else if(session.user.role === 'admin') targetDash = 'http://localhost:5173';
        else targetDash = '../seeker/dashboard.html';
    }

    document.querySelectorAll(".login-btn").forEach(btn => {
        if (session) {
            btn.innerText = "Try Now";
            btn.onclick = () => { window.location.href = targetDash; };
        } else {
            btn.onclick = () => { 
                alert("Please login to access this service."); 
                window.location.href = '../auth/login.html';
            };
        }
    });
});