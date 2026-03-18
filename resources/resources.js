// ===============================
// 🔎 LIVE SEARCH FUNCTION
// ===============================
const searchInput = document.querySelector(".top-search input");

searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    const items = document.querySelectorAll(".resource-item");

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(value) ? "flex" : "none";
    });
});


// ===============================
// 📂 SIDEBAR CATEGORY FILTER
// ===============================
const sidebarItems = document.querySelectorAll(".sidebar li");

sidebarItems.forEach(button => {
    button.addEventListener("click", function () {

        // Remove active class
        sidebarItems.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

        const category = this.innerText.toLowerCase();
        const resources = document.querySelectorAll(".resource-item");

        resources.forEach(item => {

            if (category === "all resources") {
                item.style.display = "flex";
            }
            else if (category === "interview") {
                item.style.display = item.innerText.toLowerCase().includes("interview") ? "flex" : "none";
            }
            else if (category === "resume") {
                item.style.display = item.innerText.toLowerCase().includes("resume") ? "flex" : "none";
            }
            else if (category === "placement") {
                item.style.display = item.innerText.toLowerCase().includes("placement") ? "flex" : "none";
            }
            else if (category === "courses") {
                item.style.display = item.innerText.toLowerCase().includes("course") ? "flex" : "none";
            }
        });

    });
});


// ===============================
// ⬇ DOWNLOAD COUNTER + LOGIN CHECK
// ===============================
const downloadButtons = document.querySelectorAll(".download-btn");

downloadButtons.forEach(button => {
    button.addEventListener("click", function () {

        const isPro = this.innerText.toLowerCase().includes("login");

        if (isPro) {
            alert("Please login to download this premium resource.");
            return;
        }

        const counter = this.parentElement.querySelector(".meta span:last-child");
        let count = parseInt(counter.innerText.match(/\d+/)[0]);

        count++;
        counter.innerText = "Downloaded " + count + " times";

        alert("Download started successfully!");
    });
});


