// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAuth, signOut, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAynQKK6gsGRgwNBwv0CeraTE-mJVhQA0A",
    authDomain: "moola-2e730.firebaseapp.com",
    projectId: "moola-2e730",
    storageBucket: "moola-2e730.appspot.com",
    messagingSenderId: "289598737034",
    appId: "1:289598737034:web:5f14c31456bbbd53b67b73",
    measurementId: "G-LJ7LB8K4ZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is logged in, redirect if not
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!user && !isLoginPage) {
        // User is not logged in and not on login page → redirect
        window.location.href = "login.html";
    }
});

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form.user");
    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.style.color = "red";
    errorMessageDiv.style.marginTop = "10px";

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("inputEmail")?.value.trim();
            const password = document.getElementById("inputPassword")?.value.trim();

            if (!email || !password) {
                errorMessageDiv.textContent = "Please enter both email and password.";
                loginForm.appendChild(errorMessageDiv);
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Login Error:", error);
                    errorMessageDiv.textContent = getFriendlyErrorMessage(error.code);
                    loginForm.appendChild(errorMessageDiv);
                });
        });
    }
});

// Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        alert("Error signing out: " + error.message);
    }
});

// Friendly error messages
function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/invalid-email":
            return "Invalid email format.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        default:
            return "An error occurred. Please try again.";
    }
}
