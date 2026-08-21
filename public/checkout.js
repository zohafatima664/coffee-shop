document.getElementById("checkout-form").addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
        alert("Please Login First");
        return;
    }

    const customer_name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;
    const address = document.getElementById("customer-address").value;

    try {

        // Cart data server se lo
        const cartResponse = await fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`);
        const cartData = await cartResponse.json();

        if (!cartData.success || cartData.cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Grand Total calculate karo
        let total = 0;

        cartData.cart.forEach(item => {
            total += Number(item.price) * item.quantity;
        });

        // Order save karo
        const orderResponse = await fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/place-order", {

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
await fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/cart/${user.id}`, {
    method: "DELETE"
});

// LocalStorage bhi clear
localStorage.removeItem("cart");

         // Success message show karo
document.getElementById("checkout-form").style.display = "none";

document.getElementById("order-success").style.display = "block";

        } else {

            alert(orderData.message);

        }

    } catch (err) {

        console.error(err);

        alert("Server Error");

    }

});