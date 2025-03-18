// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfeFvU5DmYb8B_s3AO7V2mNbxjteRoQr8",
  authDomain: "escrow-360.firebaseapp.com",
  databaseURL: "https://escrow-360-default-rtdb.firebaseio.com",
  projectId: "escrow-360",
  storageBucket: "escrow-360.firebasestorage.app",
  messagingSenderId: "913818328490",
  appId: "1:913818328490:web:4fc589ecc7f6dd86a35fd3",
  measurementId: "G-KKQ4Y92E5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Submit button handler
const submit = document.getElementById("submit");
submit.addEventListener("click", function (event) {
  event.preventDefault();

  const emailValue = document.getElementById("email").value.trim();
  const passwordValue = document.getElementById("password").value.trim();

  if (!emailValue || !passwordValue) {
    return; // Exit early if either field is empty
  }

  signInWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
      const user = userCredential.user;

      // Get the user's role from the database
      get(ref(database, "users/" + user.uid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const userRole = userData.role;

            if (userRole === "admin") {
              document.getElementById("popup-success").style.display = "block";
              setTimeout(() => {
                document.getElementById("popup-success").style.display = "none";
                window.location.href = "admin.html"; // Admin dashboard
              }, 1000); // 1-second timeout
            } else {
              document.getElementById("popup-success").style.display = "block";
              setTimeout(() => {
                document.getElementById("popup-success").style.display = "none";
                window.location.href = "dashboard.html"; // User dashboard
              }, 1000); // 1-second timeout
            }
          } else {
            console.error("No user data found");
            showPopup("Error: No user data found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          showPopup("Error fetching user data: " + error.message);
        });
    })
    .catch((error) => {
      if (error.code === "auth/network-request-failed") {
        alert("Network connection interrupted");
      } else {
        document.getElementById("popup-error").style.display = "block";
        setTimeout(() => {
          document.getElementById("popup-error").style.display = "none";
          window.location.href = "login.html"; // Redirect to login page
        }, 2000); // 2-second timeout
      }
    });
});

document
  .getElementById("close-popup-success")
  .addEventListener("click", function () {
    document.getElementById("popup-success").style.display = "none";
  });

document
  .getElementById("close-popup-error")
  .addEventListener("click", function () {
    document.getElementById("popup-error").style.display = "none";
    window.location.href = "login.html"; // Redirect to login page
  });

// Popup functions
const showPopup = (message) => {
  document.getElementById("popup-error").textContent = message;
  document.getElementById("popup-error").style.display = "block";
};