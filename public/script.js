const navLinks = document.querySelectorAll(".nav-menu .nav-link");
const menuOpenButton = document.querySelector("#menu-open-button");
const menucloseButton = document.querySelector("#menu-close-button");

if (menuOpenButton) {
    menuOpenButton.addEventListener("click", () => {
        document.body.classList.toggle("show-mobile-menu");
    });
}

if (menucloseButton) {
    menucloseButton.addEventListener("click", () => menuOpenButton.click());
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (menuOpenButton) menuOpenButton.click();
    });
});

// Initialize Swiper
if (document.querySelector('.slider-wrapper')) {
    const swiper = new Swiper('.slider-wrapper', {
        loop: true,
        spaceBetween: 25,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

// For Contact Us Form
const form = document.querySelector(".contact-form");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = form.querySelector("input[placeholder='Your name....']");
        const emailInput = form.querySelector("input[placeholder='Your email....']");
        const messageInput = form.querySelector("textarea");

        if (!nameInput || !emailInput || !messageInput) return;

        const name = nameInput.value;
        const email = emailInput.value;
        const message = messageInput.value;

        fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        })
        .then(res => res.text())
        .then(data => {
            alert(data);
            form.reset();
        })
        .catch(err => console.error("Contact error:", err));
    });
}

// Cart Functionality
/* ======================================================
   CART COUNT UPDATE FUNCTION (Server aur LocalStorage Sync)
====================================================== */
function updateCartIcon() {
    const user = JSON.parse(localStorage.getItem("user"));
    const cartCountElem = document.getElementById("cart-count");

    if (!cartCountElem) return;

    if (user && user.id) {
        // Agar user login hai toh server se latest count lay kar aayein
        fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                let total = data.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
                cartCountElem.innerText = total;
                // LocalStorage ko bhi update rakhein
                localStorage.setItem("cart", JSON.stringify(data.cart));
            }
        })
        .catch(err => console.error("Error fetching cart:", err));
    } else {
        // Fallback to LocalStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountElem.innerText = total;
    }
}

/* Page Load par count update karein */

function updateCartIcon() {

    const user = JSON.parse(localStorage.getItem("user"));

    const cartCountElem = document.getElementById("cart-count");

    if (!cartCountElem) return;

    if (!user || !user.id) {

        cartCountElem.innerText = "0";

        return;

    }

    fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`)

    .then(res => res.json())

    .then(data => {

        if(data.success){

            let total = 0;

            data.cart.forEach(item=>{

                total += item.quantity;

            });

            cartCountElem.innerText = total;

        }

    })

    .catch(err=>{

        console.log(err);

    });

}
/* ======================================================
   ADD TO CART LOGIC
====================================================== */

const buttons = document.querySelectorAll(".add-cart-btn");

buttons.forEach(button => {

    button.addEventListener("click", async (e) => {

        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            alert("Please login first.");
            return;
        }

        const productName = button.dataset.name;
        const productPrice = Number(button.dataset.price);
        const productImage = button.dataset.image;

        try {

            const response = await fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user_id: user.id,
                    product_name: productName,
                    price: productPrice,
                    quantity: 1

                })

            });

            const data = await response.json();

            console.log(data);

            // Server se latest count lao
            updateCartIcon();

            alert(productName + " Added To Cart");

        }

        catch(err){

            console.log(err);

        }

    });

});
/* ===========================
   LOGOUT
=========================== */

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        localStorage.removeItem("user");
        localStorage.removeItem("cart");

        alert("Logout Successful!");

        window.location.href = "loginpage.html";

    });

}
// =====================================
// PRODUCT SEARCH
// =====================================

const searchInput = document.getElementById("product-search");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText = this.value.toLowerCase().trim();

        const products = document.querySelectorAll(".menu-item");

        products.forEach(product => {

            const productName =
                product.querySelector(".name")?.textContent.toLowerCase() || "";

            const productDescription =
                product.querySelector(".text")?.textContent.toLowerCase() || "";

            if (
                productName.includes(searchText) ||
                productDescription.includes(searchText)
            ) {

                product.style.display = "";

            } else {

                product.style.display = "none";

            }

        });

    });

}
// =====================================
// WISHLIST LOGIC
// =====================================

// =====================================
// WISHLIST TOGGLE
// =====================================

const wishlistButtons = document.querySelectorAll(".wishlist-btn");

wishlistButtons.forEach(button => {

    button.addEventListener("click", () => {

        const productName = button.dataset.name;
        const productPrice = Number(button.dataset.price);

        let wishlist =
            JSON.parse(localStorage.getItem("wishlist")) || [];

        const existingIndex = wishlist.findIndex(
            item => item.name === productName
        );

        // ❤️ Already in wishlist → REMOVE
        if (existingIndex !== -1) {

            wishlist.splice(existingIndex, 1);

            button.innerText = "♡";
            button.classList.remove("active");

            alert(productName + " Removed from Wishlist");

        }

        // ♡ Not in wishlist → ADD
        else {

            wishlist.push({
                name: productName,
                price: productPrice
            });

            button.innerText = "♥";
            button.classList.add("active");

            alert(productName + " Added to Wishlist ❤️");

        }

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

    });

});
const user = JSON.parse(localStorage.getItem("user"));

if (user && user.role === "admin") {
    document.getElementById("admin-link").style.display = "inline-block";
}
// =====================================
// AI COFFEE ASSISTANT
// =====================================

// =====================================
// AI COFFEE ASSISTANT
// =====================================

const aiBtn = document.getElementById("ai-btn");
const aiQuestion = document.getElementById("ai-question");
const aiResponse = document.getElementById("ai-response");

if (aiBtn) {

    aiBtn.addEventListener("click", async () => {

        const question = aiQuestion.value.trim();

        if (!question) {
            aiResponse.innerHTML =
                "🤖 Please ask me something about coffee ☕";
            return;
        }

        aiResponse.innerHTML =
            `<div class="ai-loading">🤖 Finding the perfect drink for you...</div>`;

        try {

            const response = await fetch(
                "[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/ai-recommend",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question
                    })
                }
            );

            const data = await response.json();

            if (!data.success || !data.product) {

                aiResponse.innerHTML =
                    `<div class="ai-error">
                        😔 Sorry, I couldn't find a matching product.
                    </div>`;

                return;
            }

            const product = data.product;

            aiResponse.innerHTML = `

                <div class="ai-recommendation">

                    <div class="ai-recommendation-text">
                        🤖 ${data.answer}
                    </div>

                    <div class="ai-product-card">

                        <div class="ai-product-image">
                            <img 
                                src="${product.image}"
                                alt="${product.name}"
                            >
                        </div>

                        <div class="ai-product-info">

                            <span class="ai-product-category">
                                ${product.category}
                            </span>

                            <h3>${product.name}</h3>

                            <p>
                                ${product.description}
                            </p>

                            <div class="ai-product-bottom">

                                <span class="ai-product-price">
                                    $${Number(product.price).toFixed(2)}
                                </span>

                                <button
                                    class="ai-add-cart-btn"
                                    data-name="${product.name}"
                                    data-price="${product.price}"
                                    data-image="${product.image}"
                                >
                                    🛒 Add to Cart
                                </button>

                            </div>

                        </div>

                    </div>

                    <div class="ai-reason">
                        💡 ${data.reason}
                    </div>

                </div>

            `;

            // Add to Cart button
            const addButton =
                aiResponse.querySelector(".ai-add-cart-btn");

            if (addButton) {

                addButton.addEventListener("click", async () => {

                    const user =
                        JSON.parse(localStorage.getItem("user"));

                    if (!user || !user.id) {

                        alert("Please login first.");
                        return;

                    }

                    try {

                        const cartResponse = await fetch(
                            "[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({

                                    user_id: user.id,
                                    product_name: product.name,
                                    price: Number(product.price),
                                    quantity: 1

                                })
                            }
                        );

                        const cartData =
                            await cartResponse.json();

                        if (cartData.success) {

                            alert(
                                product.name +
                                " Added To Cart 🛒"
                            );

                            updateCartIcon();

                        } else {

                            alert(
                                cartData.message ||
                                "Could not add product."
                            );

                        }

                    } catch (error) {

                        console.error(
                            "AI Cart Error:",
                            error
                        );

                        alert(
                            "Unable to add product to cart."
                        );

                    }

                });

            }

        } catch (error) {

            console.error(
                "AI Recommendation Error:",
                error
            );

            aiResponse.innerHTML =
                `<div class="ai-error">
                    ❌ AI recommendation server connection failed.
                </div>`;
        }

    });

}