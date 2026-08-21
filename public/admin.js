async function loadDashboardStats() {

    try {

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            console.log("Admin user not found");
            return;
        }

        const response = await fetch(
            "[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/stats",
            {
                headers: {
                    "user-id": user.id
                }
            }
        );

        const data = await response.json();

        console.log("ADMIN STATS:", data);

        if (!data.success) {
            alert(data.message);
            return;
        }

        document.getElementById("total-orders").innerText =
            data.stats.totalOrders;

        document.getElementById("total-users").innerText =
            data.stats.totalUsers;

        document.getElementById("total-messages").innerText =
            data.stats.totalMessages;

    }

    catch(err) {

        console.log(err);

    }

}
async function loadMessages() {
    try {
           const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
    console.log("Admin user not found");
    return;
}

let res = await fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/messages", {
    headers: {
        "user-id": user.id
    }
});

        console.log("STATUS:", res.status);

        // ❌ If route not found
        if (!res.ok) {
            throw new Error("Server Error: " + res.status);
        }

        let data = await res.json();
        console.log("DATA:", data);

        let table = "";

        data.forEach(row => {
            table += `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.name}</td>
                    <td>${row.email}</td>
                    <td>${row.message}</td>
                </tr>
            `;
        });

        document.getElementById("data").innerHTML = table;

    } catch (err) {
        console.log("ERROR:", err);
        document.getElementById("error").innerText =
            "❌ Data not loaded check backend route plzz!";
    }
}

loadMessages();
loadDashboardStats();
// =====================================
// LOAD ALL ORDERS
// =====================================

async function loadOrders() {

    try {

         const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
    console.log("Admin user not found");
    return;
}

const res = await fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/orders", {
    headers: {
        "user-id": user.id
    }
});

        const data = await res.json();

        const tbody = document.getElementById("orders-data");

        tbody.innerHTML = "";

        if (!data.success || data.orders.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">No Orders Found</td>
                </tr>
            `;

            return;

        }

        data.orders.forEach(order => {

            tbody.innerHTML += `
                <tr>

                    <td>${order.id}</td>

                    <td>${order.customer_name}</td>

                    <td>${order.phone}</td>

                    <td>${order.address}</td>

                    <td>$${Number(order.total).toFixed(2)}</td>

                     <td>

             <select
    class="status-select"
    onchange="updateStatus(${order.id}, this.value)">

    <option value="Pending"
        ${order.status === "Pending" ? "selected" : ""}>
        Pending
    </option>

    <option value="Preparing"
        ${order.status === "Preparing" ? "selected" : ""}>
        Preparing
    </option>

    <option value="Delivered"
        ${order.status === "Delivered" ? "selected" : ""}>
        Delivered
    </option>

    <option value="Cancelled"
        ${order.status === "Cancelled" ? "selected" : ""}>
        Cancelled
    </option>

</select>

</td>

                    <td>
                        ${new Date(order.order_date).toLocaleString()}
                    </td>

                </tr>
            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

loadOrders();
async function updateStatus(orderId, status) {

    try {

        const user = JSON.parse(localStorage.getItem("user"));

        const response = await fetch(
            `[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/order/${orderId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "user-id": user.id
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        console.log("STATUS UPDATE:", data);

        if (data.success) {

            alert("✅ Order status updated!");

            loadOrders();

        } else {

            alert("❌ " + data.message);

        }

    } catch (err) {

        console.log(err);

        alert("❌ Error Updating Status");

    }
}
// =====================================
// LOAD PRODUCTS
// =====================================

async function loadProducts() {

    try {

        const response = await fetch("[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/products");

        const data = await response.json();

        const tbody = document.getElementById("products-data");

        tbody.innerHTML = "";

        if (!data.success || data.products.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No Products Found
                    </td>
                </tr>
            `;

            return;

        }

        data.products.forEach(product => {

            tbody.innerHTML += `

            <tr>

                <td>${product.id}</td>

                <td>
                    <img
                        src="${product.image}"
                        width="60"
                        height="60"
                        style="border-radius:10px;"
                    >
                </td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>$${Number(product.price).toFixed(2)}</td>
                   <td>

<button
class="edit-btn"
onclick="editProduct(${product.id},
'${product.name}',
'${product.description}',
'${product.price}',
'${product.image}',
'${product.category}')">

Edit

</button>

<button
class="delete-btn"
onclick="deleteProduct(${product.id})">

Delete

</button>

</td>
             

            </tr>

            `;

        });

    }

    catch(err){

        console.log(err);

    }

}

loadProducts();
// =====================================
// DELETE PRODUCT
// =====================================

async function deleteProduct(productId) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(
            `[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/product/${productId}`,
            {
                method: "DELETE",
                   headers: {
            "user-id": user.id
        }
            }
        );

        const data = await response.json();

        alert(data.message);

        loadProducts();

    } catch (err) {

        console.log(err);

        alert("Error deleting product");

    }

}
async function editProduct(id, name, description, price, image, category){

    const newName = prompt("Product Name:", name);
    if(newName === null) return;

    const newDescription = prompt("Description:", description);
    if(newDescription === null) return;

    const newPrice = prompt("Price:", price);
    if(newPrice === null) return;

    const newImage = prompt("Image:", image);
    if(newImage === null) return;

    const newCategory = prompt("Category:", category);
    if(newCategory === null) return;

    try{

        const response = await fetch(
            `[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/product/${id}`,
            {
                method:"PUT",
                headers:{
    "Content-Type":"application/json",
    "user-id": JSON.parse(localStorage.getItem("user")).id
},
                body:JSON.stringify({

                    name:newName,
                    description:newDescription,
                    price:newPrice,
                    image:newImage,
                    category:newCategory

                })
            }
        );

        const data = await response.json();

        alert(data.message);

        loadProducts();

    }

    catch(err){

        console.log(err);

        alert("Update Failed");

    }

}
// =====================================
// ADD PRODUCT
// =====================================

const productForm = document.getElementById("product-form");

productForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = {

        name: document.getElementById("product-name").value,

        description: document.getElementById("product-description").value,

        price: document.getElementById("product-price").value,

        image: document.getElementById("product-image").value,

        category: document.getElementById("product-category").value

    };

    try {

        const response = await fetch(
            "[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/product",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)
            }
        );

        const data = await response.json();

        alert(data.message);

        productForm.reset();

        loadProducts();

    } catch (err) {

        console.log(err);

        alert("Error Adding Product");

    }

});
// =====================================
// UPDATE ORDER STATUS
// =====================================
async function updateStatus(orderId, status) {

    try {

        const user = JSON.parse(localStorage.getItem("user"));

        const response = await fetch(
            `[https://coffee-shop-s.vercel.app](https://coffee-shop-s.vercel.app)/admin/order-status/${orderId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "user-id": user.id
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        console.log("STATUS UPDATE:", data);

        if (data.success) {

            alert("✅ Order Status Updated Successfully!");

            loadOrders();

        } else {

            alert("❌ " + data.message);

        }

    } catch (err) {

        console.log("STATUS ERROR:", err);

        alert("❌ Error Updating Status");

    }
}
