const fs = require("fs");
const path = require("path");
require("dotenv").config();
console.log("THIS IS MY NEW SERVER FILE");

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("/hello", (req, res) => {
    res.send(req.method + " WORKING");
});

// ================================
// DATABASE CONNECTION (POOL)
// ================================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ssl: { 
        rejectUnauthorized: false
    }
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("Database Connection Failed", err);
    } else {
        console.log("Database Connected Successfully");
        connection.release();
    }
});
// ================================
// DATABASE CONNECTION (POOL)
// ================================

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     ssl: { 
//         rejectUnauthorized: false
//     }
// });

// db.getConnection((err, connection) => {
//     if (err) {
//         console.log("Database Connection Failed");
//         console.log(err);
//     } else {
//         console.log("Database Connected Successfully");
//         connection.release();
//     }
// });
// // Database connection ke baad yeh loop laga dein taake connection zinda rahe
// setInterval(() => {
//     db.query('SELECT 1', (err) => {
//         if (err) console.log('Keep-alive ping error:', err);
//     });
// }, 30000); // Har 30 seconds baad aik choti si query chalay ga


// ================================
// SIGNUP
// ================================

app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    const checkSql = "SELECT * FROM users WHERE email=?";

    db.query(checkSql, [email], (err, result) => {

        if (err) {
            console.log("Signup Check Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database Error",
                error: err.message
            });
        }

        if (result.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });

        }

        const sql =
        "INSERT INTO users(name,email,password) VALUES(?,?,?)";

        db.query(sql,[name,email,password],(err,data)=>{

            if(err){

                return res.status(500).json({
                    success:false,
                    message:"Signup Failed"
                });

            }

            res.json({

                success:true,

                message:"Signup Successful",

                user:{
                    id:data.insertId,
                    name:name,
                    email:email
                }

            });

        });

    });

});



// ================================
// LOGIN
// ================================

app.post("/login",(req,res)=>{

    const {email,password}=req.body;
   

    const sql="SELECT * FROM users WHERE email=? AND password=?";

       db.query(sql,[email,password],(err,result)=>{


        if(err){

            return res.status(500).json({
                success:false
            });

        }

        if(result.length===0){

            return res.status(401).json({

                success:false,

                message:"Invalid Email or Password"

            });

        }

        res.json({

            success:true,

            user:{

                id:result[0].id,
                name:result[0].name,
                email:result[0].email,
                    role: result[0].role

            }

        });

    });

});



// ================================
// CONTACT FORM
// ================================

app.post("/contact",(req,res)=>{

    const {name,email,message}=req.body;

    const sql=
    "INSERT INTO contacts(name,email,message) VALUES(?,?,?)";

    db.query(sql,[name,email,message],(err)=>{

        if(err){

            console.log(err);

            return res.status(500).send("Database Error");

        }

        res.send("Message Saved Successfully");

    });

});
// ================================
// ADD TO CART
// ================================

app.post("/cart", (req, res) => {

    const { user_id, product_name, price, quantity } = req.body;

    const sql = `
        INSERT INTO cart(user_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, product_name, price, quantity], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            message: "Product Added To Cart",
            cartId: result.insertId
        });

    });

});


// ================================
// GET USER CART
// ================================

app.get("/cart/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM cart
        WHERE user_id=?
        ORDER BY id DESC
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({

            success: true,

            cart: result

        });

    });

});


// ================================
// REMOVE SINGLE CART ITEM
// ================================

app.delete("/cart-item/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM cart WHERE id=?",
        [id],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Item Removed Successfully"
            });

        }
    );

});
console.log("DELETE ROUTE LOADED");

// ================================
// CLEAR COMPLETE CART
// ================================

app.delete("/cart/:userId", (req, res) => {

    const userId = req.params.userId;

    db.query(
        "DELETE FROM cart WHERE user_id=?",
        [userId],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Cart Cleared Successfully"
            });

        }
    );

});
 
// =====================================
// ADMIN AUTHORIZATION
// =====================================

function checkAdmin(req, res, next) {

    const userId = req.headers["user-id"];

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Login required"
        });
    }

    const sql = "SELECT role FROM users WHERE id = ?";

    db.query(sql, [userId], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0 || result[0].role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        next();
    });
}
// ================================
// ADMIN DASHBOARD STATS
// ================================

app.get("/admin/stats", checkAdmin, (req, res) => {

    const stats = {};

    db.query("SELECT COUNT(*) AS totalOrders FROM orders", (err, orderResult) => {

        if (err) {
            return res.status(500).json({ success: false });
        }

        stats.totalOrders = orderResult[0].totalOrders;

        db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, userResult) => {

            if (err) {
                return res.status(500).json({ success: false });
            }

            stats.totalUsers = userResult[0].totalUsers;

            db.query("SELECT COUNT(*) AS totalMessages FROM contacts", (err, messageResult) => {

                if (err) {
                    return res.status(500).json({ success: false });
                }

                stats.totalMessages = messageResult[0].totalMessages;

                res.json({
                    success: true,
                    stats: stats
                });

            });

        });

    });

});
// ================================
// ADMIN PANEL - CONTACT MESSAGES
// ================================


   app.get("/admin/messages", checkAdmin, (req, res) => {
    const sql = `
        SELECT *
        FROM contacts
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json(result);

    });

});
// ================================
// PLACE ORDER
// ================================

app.post("/place-order", (req, res) => {

    const {
        user_id,
        customer_name,
        phone,
        address,
        total
    } = req.body;

    const sql = `
        INSERT INTO orders
        (user_id, customer_name, phone, address, total)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [user_id, customer_name, phone, address, total],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            res.json({
                success: true,
                message: "Order Placed Successfully",
                orderId: result.insertId
            });

        }
    );

});
// ================================
// GET USER ORDERS
// ================================

app.get("/orders/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            orders: result
        });

    });

});
// ================================
// CANCEL ORDER
// ================================

app.delete("/order/:id", (req, res) => {

    const orderId = req.params.id;

    db.query(
        "DELETE FROM orders WHERE id=?",
        [orderId],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Order Cancelled Successfully"
            });

        }
    );

});
// ================================
// ADMIN - GET ALL ORDERS
// ================================

app.get("/admin/orders", (req, res) => {

    const sql = `
        SELECT *
        FROM orders
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            orders: result
        });

    });

});
// ================================
// UPDATE ORDER STATUS
// ================================

app.put("/admin/order-status/:id", (req, res) => {

    const orderId = req.params.id;
    const { status } = req.body;

    const sql = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, orderId], (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            message: "Order Status Updated Successfully"
        });

    });

});
// ================================
// DELETE PRODUCT
// ================================

   app.delete("/admin/product/:id", checkAdmin, (req, res) => {

    const productId = req.params.id;

    const sql = `
        DELETE FROM products
        WHERE id = ?
    `;

    db.query(sql, [productId], (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            message: "Product Deleted Successfully"
        });

    });

});
// ================================
// GET ALL PRODUCTS (ADMIN)
// ================================

app.get("/admin/products", (req, res) => {

    const sql = `
        SELECT *
        FROM products
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            products: result
        });

    });

});

// ================================
// ADD PRODUCT
// ================================

app.post("/admin/product", (req, res) => {

    const {
        name,
        description,
        price,
        image,
        category
    } = req.body;

    const sql = `
        INSERT INTO products
        (name, description, price, image, category)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, description, price, image, category],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Product Added Successfully"
            });

        }
    );

});
// ================================
// DELETE PRODUCT
// ================================

app.delete("/admin/product/:id", (req, res) => {

    const productId = req.params.id;

    db.query(
        "DELETE FROM products WHERE id = ?",
        [productId],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Product Deleted Successfully"
            });

        }
    );

});
// =====================================
// UPDATE PRODUCT
// =====================================
      app.put("/admin/product/:id", checkAdmin, (req, res) => {

    const productId = req.params.id;

    const {
        name,
        description,
        price,
        image,
        category
    } = req.body;

    const sql = `
        UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            image = ?,
            category = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            description,
            price,
            image,
            category,
            productId
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({
                success: true,
                message: "Product Updated Successfully"
            });

        }
    );

});
// =====================================
// AI COFFEE ASSISTANT
// =====================================
// =====================================
// FREE AI COFFEE ASSISTANT
// =====================================

app.post("/ai-recommend", (req, res) => {

    const { question } = req.body;

    if (!question) {
        return res.status(400).json({
            success: false,
            message: "Please ask a question."
        });
    }

    const q = question.toLowerCase();

    let sql = "";
    let reason = "";

    // SUMMER / COLD
    if (
        q.includes("summer") ||
        q.includes("hot") ||
        q.includes("cold") ||
        q.includes("refresh") ||
        q.includes("cool")
    ) {

        sql = `
            SELECT *
            FROM products
            WHERE category = 'Cold'
            LIMIT 1
        `;

        reason = "Perfect for a hot and refreshing day! 🧊☕";

    }

    // SWEET / DESSERT
    else if (
        q.includes("sweet") ||
        q.includes("dessert") ||
        q.includes("cake") ||
        q.includes("chocolate")
    ) {

        sql = `
            SELECT *
            FROM products
            WHERE category = 'Dessert'
            LIMIT 1
        `;

        reason = "Great choice if you like something sweet! 🍰❤️";

    }

    // HOT COFFEE
    else if (
        q.includes("coffee") ||
        q.includes("hot drink") ||
        q.includes("warm")
    ) {

        sql = `
            SELECT *
            FROM products
            WHERE category = 'Hot'
            LIMIT 1
        `;

        reason = "A nice choice for coffee lovers! ☕";

    }

    // DEFAULT
    else {

        sql = `
            SELECT *
            FROM products
            ORDER BY id DESC
            LIMIT 1
        `;

        reason = "Here's one of our available products you might enjoy! ☕❤️";

    }

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.json({
                success: true,
                answer: "Sorry, I couldn't find a matching product."
            });

        }

        const product = result[0];

        res.json({

            success: true,

            answer:
                `🤖 Based on your preference, I recommend: ${product.name} ($${product.price}) ☕❤️`,

            product: product,

            reason: reason

        });

    });

});
// ================================
// DEFAULT ROUTE
// ================================

// app.get("/", (req, res) => {
//     res.send("Coffee Shop Backend is Running Successfully ☕");
// });


// 1. Static files (HTML, CSS, JS, Images) ko allow karne ke liye
app.use(express.static(path.join(__dirname)));



// Jab koi website ka main link khole toh pehle Login Page aaye
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'loginpage.html'));
});

// ================================
// 404 ROUTE
// ================================
app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(Object.keys(r.route.methods), r.route.path);
    }
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});


// ================================
// START SERVER
// ================================
app.delete("/test", (req, res) => {
    res.json({
        success: true,
        message: "DELETE WORKING"
    });
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});