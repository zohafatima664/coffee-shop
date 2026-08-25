document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
        alert("Please Login First");
        window.location.href = "loginpage.html";
        return;
    }

    try {
        // Vercel link hata kar relative path kar diya hai
        const response = await fetch(`/orders/${user.id}`);
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
            // Yahan order_date ko theek karke created_at kar diya hai
            const orderDate = order.created_at ? new Date(order.created_at).toLocaleString() : "N/A";

            const row = `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.phone}</td>
                    <td>$${Number(order.total).toFixed(2)}</td>
                    <td>${orderDate}</td>
                    <td>
                        <span class="status ${order.status ? order.status.toLowerCase() : 'pending'}">
                            ${order.status || 'Pending'}
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
        // Yahan se bhi Vercel link hata diya hai
        const response = await fetch(`/order/${orderId}`, {
            method: "DELETE"
        });

        const data = await response.json();
        alert(data.message);
        loadOrders();

    } catch (err) {
        console.error(err);
    }
}