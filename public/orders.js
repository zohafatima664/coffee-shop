document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {

        alert("Please Login First");

        window.location.href = "loginpage.html";

        return;

    }

    try {

        const response = await fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/orders/${user.id}`);

        const data = await response.json();

        const tbody = document.getElementById("orders-body");

        tbody.innerHTML = "";

        if (!data.success || data.orders.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">No Orders Found ☕</td>
                </tr>
            `;

            return;

        }

        data.orders.forEach(order => {

    const row = `
    <tr>

        <td>#${order.id}</td>

        <td>${order.customer_name}</td>

        <td>${order.phone}</td>

        <td>$${Number(order.total).toFixed(2)}</td>

        <td>${new Date(order.order_date).toLocaleString()}</td>

        <td>
            <span class="status ${order.status.toLowerCase()}">
                ${order.status}
            </span>
        </td>

    </tr>
    `;

    tbody.innerHTML += row;

});

    

    } catch (err) {

        console.error(err);

        alert("Error Loading Orders");

    }

}
async function cancelOrder(orderId) {

    if (!confirm("Are you sure you want to cancel this order?")) {
        return;
    }

    try {

        const response = await fetch(`[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/order/${orderId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);

        loadOrders();

    } catch (err) {

        console.error(err);

    }

}