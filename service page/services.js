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

// Login Modal
document.querySelectorAll(".login-btn").forEach(btn=>{
    btn.addEventListener("click", function(){
        alert("Please login to access this service.");
    });
});