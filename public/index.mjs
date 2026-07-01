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
const nativeFetch = window.fetch.bind(window);

window.fetch = async (resource, options = {}) => {
    const requestUrl = typeof resource === 'string' ? resource : resource.url;
    const url = new URL(requestUrl, window.location.origin);
    const headers = new Headers(options.headers || {});

    if (url.origin === window.location.origin && auth.currentUser) {
        headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
    }

    return nativeFetch(resource, {
        ...options,
        headers,
    });
};

async function getAccountType(user) {
    try {
        const response = await fetch('/account-role');

        if (!response.ok) {
            throw new Error('Could not load account access');
        }

        const data = await response.json();
        return data.account_type === 'guide' ? 'guide' : 'admin';
    } catch (error) {
        console.error('Account role lookup failed:', error);
    }

    return null;
}

// Check if user is logged in, redirect if not
onAuthStateChanged(auth, async (user) => {
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!user && !isLoginPage) {
        // User is not logged in and not on login page → redirect
        window.location.href = "login.html";
        return;
    }

    if (user) {
        const adminName = user.displayName || user.email || 'Admin';
        const accountType = await getAccountType(user);

        if (!accountType) {
            localStorage.removeItem('currentAccountType');
            document.body.dataset.accountType = 'blocked';
            const listContainer = document.getElementById('listContainer');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="alert alert-danger mt-3" role="alert">
                        Could not verify access for this account. Ask an admin to add this email in Settings.
                    </div>
                `;
            }
            return;
        }

        window.currentAdmin = {
            name: adminName,
            email: user.email || '',
            uid: user.uid,
            account_type: accountType,
        };
        localStorage.setItem('currentAdminName', adminName);
        localStorage.setItem('currentAccountType', accountType);
        const adminNameElement = document.getElementById('currentAdminName');
        if (adminNameElement) {
            adminNameElement.textContent = adminName;
        }
        const accountTypeElement = document.getElementById('currentAccountType');
        if (accountTypeElement) {
            accountTypeElement.textContent = accountType === 'admin' ? 'Admin account' : 'Guide account';
        }
        document.body.dataset.accountType = accountType;
        window.dispatchEvent(new CustomEvent('admin-ready', { detail: window.currentAdmin }));
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
