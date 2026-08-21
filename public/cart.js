/* ======================================================
   LOAD CART DATA FROM MYSQL DATABASE ON CART PAGE
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadCartData();
});

function loadCartData() {
    const user = JSON.parse(localStorage.getItem("user"));
    const cartBody = document.getElementById("cart-body");
    const grandTotal = document.getElementById("grand-total");
    const cartCountElem = document.getElementById("cart-count");

    if (!user || !user.id) {
        alert("Please login first!");
        window.location.href = "loginpage.html"; // Agar login nahi hai toh login page par bhej dein
        return;
    }

    // Server se is user ka cart data mangwana
    fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const cartItems = data.cart;
            
            if (cartBody) {
                cartBody.innerHTML = "";
            }
            let total = 0;
            let totalCount = 0;

            if (cartItems.length === 0) {
                if (cartBody) {
                    cartBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-cart">
                            Your cart is empty ☕
                        </td>
                    </tr>
                    `;
                }
                if (grandTotal) grandTotal.innerText = "Grand Total : $0.00";
                if (cartCountElem) cartCountElem.innerText = "0";
                return;
            }

            // Har item ko table mein dikhana
            cartItems.forEach((item, index) => {
                let qty = item.quantity || 1;
                let price = Number(item.price);
                let itemTotal = price * qty;
                total += itemTotal;
                totalCount += qty;

                if (cartBody) {
                    cartBody.innerHTML += `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>$${price.toFixed(2)}</td>
                        <td>${qty}</td>
                        <td>$${itemTotal.toFixed(2)}</td>
                        <td>
                            <button class="remove-btn" onclick="removeDbItem(${item.id})">Remove</button>
                        </td>
                    </tr>
                    `;
                }
            });

            if (grandTotal) grandTotal.innerText = "Grand Total : $" + total.toFixed(2);
            if (cartCountElem) cartCountElem.innerText = totalCount;
        }
    })
    .catch(err => console.error("Error loading cart:", err));
}

/* ======================================================
   CLEAR CART FROM DATABASE & UI
====================================================== */

/* ======================================================
   CLEAR CART FROM DATABASE & UI
====================================================== */

const clearBtn = document.getElementById("clear-cart");

if (clearBtn) {

    clearBtn.addEventListener("click", async () => {

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            alert("Please Login First");
            return;
        }

        try {

            const response = await fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (data.success) {

                // LocalStorage bhi clear karo
                localStorage.removeItem("cart");

                // Cart icon ko zero karo
                const cartCount = document.getElementById("cart-count");
                if (cartCount) {
                    cartCount.innerText = "0";
                }

                // Cart table dobara load karo
                loadCartData();

                alert("Cart Cleared Successfully");

            } else {

                alert(data.message);

            }

        } catch (err) {

            console.error(err);

        }

    });

}
/* ======================================================
   REMOVE SINGLE ITEM FROM DATABASE
====================================================== */
function removeDbItem(cartId) {
    fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart-item/${cartId}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.message);
        loadCartData(); // Table dobara load hoga
    })
    .catch(err => console.error("Error removing item:", err));
}

/* ======================================================
   CHECKOUT BUTTON
====================================================== */

const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {

    checkoutBtn.addEventListener("click", () => {

        window.location.href = "checkout.html";

    });

}
