// ================= 1. VARIABLES SETUP =================
const confirmPasswordInput = document.getElementById("confirmPassword");
const toggleConfirmPassword = document.querySelector(".toggleConfirmPassword");

const togglePassword = document.querySelector(".togglePassword");
const passwordInput = document.getElementById("password");

const signupBtn = document.querySelector(".SignUpBtn");
const signinBtn = document.querySelector(".SignInBtn");
const submitBtn = document.querySelector(".SubmitBtn");

const nameField = document.querySelector(".namefield");
const title = document.querySelector(".title");
const text = document.querySelector(".text");

const rememberMe = document.getElementById("rememberMe");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const themeToggle = document.getElementById("themeToggle");

// Toast Function
function showToast(message, type) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.className = "";
    toast.classList.add(type);
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

let mode = "signup"; // Default mode

// ================= 2. SHOW / HIDE PASSWORD =================
if (togglePassword) {
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            passwordInput.type = "password";
            togglePassword.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}

// ================= Password Strength Checker =================
if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        const password = passwordInput.value;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (!strengthBar || !strengthText) return;

        switch (strength) {
            case 0:
            case 1:
                strengthBar.style.width = "25%";
                strengthBar.style.background = "red";
                strengthText.innerHTML = "Weak Password";
                break;
            case 2:
                strengthBar.style.width = "50%";
                strengthBar.style.background = "orange";
                strengthText.innerHTML = "Medium Password";
                break;
            case 3:
                strengthBar.style.width = "75%";
                strengthBar.style.background = "#00b894";
                strengthText.innerHTML = "Strong Password";
                break;
            case 4:
                strengthBar.style.width = "100%";
                strengthBar.style.background = "green";
                strengthText.innerHTML = "Very Strong Password";
                break;
        }
    });
}

// ================= 3. SHOW / HIDE CONFIRM PASSWORD =================
if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener("click", () => {
        if (confirmPasswordInput.type === "password") {
            confirmPasswordInput.type = "text";
            toggleConfirmPassword.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            confirmPasswordInput.type = "password";
            toggleConfirmPassword.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}

// ================= 4. SWITCH TO SIGN UP MODE =================
signupBtn.addEventListener("click", () => {
    mode = "signup";
    document.querySelector(".confirmPasswordField").style.maxHeight = "60px";
    nameField.style.maxHeight = "60px";
    title.innerHTML = "Sign Up";
    if(text) text.innerHTML = "Password Suggestions";

    signupBtn.classList.remove("disable");
    signinBtn.classList.add("disable");

    // Reset Submit Button State
    submitBtn.disabled = false;
    const btnTextElem = submitBtn.querySelector(".btnText");
    if(btnTextElem) btnTextElem.innerHTML = "Submit";
});

// ================= 5. SWITCH TO SIGN IN MODE =================
signinBtn.addEventListener("click", () => {
    document.querySelector(".confirmPasswordField").style.maxHeight = "0";
    mode = "signin";
    nameField.style.maxHeight = "0";
    title.innerHTML = "Sign In";
    if(text) text.innerHTML = "Forgot Password?";

    signinBtn.classList.remove("disable");
    signupBtn.classList.add("disable");

    // Reset Submit Button State
    submitBtn.disabled = false;
    const btnTextElem = submitBtn.querySelector(".btnText");
    if(btnTextElem) btnTextElem.innerHTML = "Submit";
});

// ================= 6. SUBMIT BUTTON EVENT =================
submitBtn.addEventListener("click", async () => {
    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");

    if (mode === "signup") {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            showToast("Please fill all fields!", "error");
            return;
        }

        if (name.length < 3) {
            showToast("Name must contain at least 3 characters.", "error");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showToast("Please enter a valid email.", "error");
            return;
        }

        if (password.length < 8) {
            showToast("Password must be at least 8 characters.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
        }

        submitBtn.disabled = true;
        const btnTextElem = submitBtn.querySelector(".btnText");
        if(btnTextElem) btnTextElem.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

        try {
            console.log("Sending Signup Request...");
          const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
});

            // Safe parsing to handle both JSON and plain-text errors safely
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const textData = await response.text();
                data = { message: textData };
            }

            console.log("Response received:", data);

            if (!response.ok) {
                showToast(data.message || "Signup Failed!", "error");
                submitBtn.disabled = false;
                if(btnTextElem) btnTextElem.innerHTML = "Submit";
                return;
            }

            showToast(data.message || "User Registered Successfully", "success");

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            console.error("Signup Error:", error);
            submitBtn.disabled = false;
            if(btnTextElem) btnTextElem.innerHTML = "Submit";
            showToast("Signup Failed! Server error.", "error");
        }

    } else {
        // Sign In Mode
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showToast("Please enter email and password!", "error");
            return;
        }

        submitBtn.disabled = true;
        const btnTextElem = submitBtn.querySelector(".btnText");
        if(btnTextElem) btnTextElem.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

        try {
            console.log("Sending Login Request...");
       const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
});

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const textData = await response.text();
                data = { message: textData };
            }

            console.log("Login Response received:", data);

            if (!response.ok) {
                showToast(data.message || "Login Failed!", "error");
                submitBtn.disabled = false;
                if(btnTextElem) btnTextElem.innerHTML = "Submit";
                return;
            }

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            if (rememberMe && rememberMe.checked) {
                localStorage.setItem("rememberEmail", email);
            } else {
                localStorage.removeItem("rememberEmail");
            }

            showToast("Login Successful", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            console.error("Login Error:", error);
            submitBtn.disabled = false;
            if(btnTextElem) btnTextElem.innerHTML = "Submit";
            showToast("Login Failed! Server error.", "error");
        }
    }
});

// Auto Load Remembered Email & Theme
window.addEventListener("load", () => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail && document.getElementById("email")) {
        document.getElementById("email").value = savedEmail;
        if(rememberMe) rememberMe.checked = true;
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if(themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// Theme Switch
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });
}