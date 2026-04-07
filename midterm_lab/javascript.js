const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".navigation-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

document.querySelectorAll(".navigation-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});




$(document).ready(function () {
    $.ajax({
        url: "https://fakestoreapi.com/products?limit=4",
        method: "GET",
        success: function (data) {
            $("#deals-container").empty(); // clear old

            data.forEach(product => {
                let card = `
                    <div class="deal-card">
                        <img src="${product.image}" alt="${product.title}">
                        <h3>${product.title.substring(0, 40)}...</h3>
                        <p>$${product.price}</p>
                        <button class="quick-view-btn" 
                            data-title="${product.title}"
                            data-desc="${product.description}"
                            data-rating="${product.rating.rate}">
                            Quick View
                        </button>
                    </div>
                `;
                $("#deals-container").append(card);
            });
        }
    });
});