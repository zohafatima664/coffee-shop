document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
        alert("Please Login First");
        window.location.href = "loginpage.html";
        return;
    }

    const customer_name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;
    const address = document.getElementById("customer-address").value;

    try {
        // 🌟 Relative URL use kiya hai taake local server par theek chale
        const cartResponse = await fetch(`/cart/${user.id}`);
        const cartData = await cartResponse.json();

        if (!cartData.success || !cartData.cart || cartData.cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Grand Total calculate karo
        let total = 0;
        cartData.cart.forEach(item => {
            total += Number(item.price) * (item.quantity || 1);
        });

        // Order save karo (Relative URL)
        const orderResponse = await fetch("/place-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                customer_name,
                phone,
                address,
                total
            })
        });

        const orderData = await orderResponse.json();

        if (orderData.success) {
            // Order save hone ke baad cart clear karo
            await fetch(`/cart/${user.id}`, {
                method: "DELETE"
            });

            // LocalStorage bhi clear
            localStorage.removeItem("cart");

            // Success message show karo
            const formElem = document.getElementById("checkout-form");
            const successElem = document.getElementById("order-success");
            
            if (formElem) formElem.style.display = "none";
            if (successElem) successElem.style.display = "block";

        } else {
            alert(orderData.message || "Failed to place order");
        }

    } catch (err) {
        console.error("Checkout error:", err);
        alert("Server Error");
    }
});