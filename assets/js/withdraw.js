// Initialize Firebase (make sure this is done before using Firebase)
// Replace the config object with your Firebase project's config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfeFvU5DmYb8B_s3AO7V2mNbxjteRoQr8",
  authDomain: "escrow-360.firebaseapp.com",
  databaseURL: "https://escrow-360-default-rtdb.firebaseio.com",
  projectId: "escrow-360",
  storageBucket: "escrow-360.firebasestorage.app",
  messagingSenderId: "913818328490",
  appId: "1:913818328490:web:4fc589ecc7f6dd86a35fd3",
  measurementId: "G-KKQ4Y92E5S",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const logoutButton = document.getElementById("logoutButton");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
const confirmationPopup = document.getElementById("confirmationPopup");

document.addEventListener("DOMContentLoaded", function () {
  const withdrawalForm = document.getElementById("withdrawalForm");
  const numberElement = document.querySelectorAll("#number-element");

  onAuthStateChanged(auth, (user) => {
    const loadingScreen = document.getElementById("loading-screen");
    const dashboardContent = document.getElementById("dashboard-content");
    const withdrawal = document.getElementById("withdraw");

    if (user) {
      loadingScreen.style.display = "none";
      dashboardContent.style.display = "block";
      withdrawal.style.display = "block";

      const userId = user.uid;
      displayUserData(userId);
    } else {
      window.location.href = "login.html";
    }
  });

  withdrawalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const withdrawAmount = parseFloat(
      document.getElementById("withdraw-amount").value.trim()
    );
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, "users/" + user.uid + "/balance");

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const balance = snapshot.val();
            if (withdrawAmount > balance) {
              alert("Insufficient balance.");
            } else {
              alert("Withdrawal Processing...");
              window.location.href = "withdraw.html";
            }
          } else {
            alert("No balance information found.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving balance:", error);
        });
    } else {
      alert("No user is signed in. Please sign in first.");
    }
  });

  if (numberElement) {
    const number = parseFloat(numberElement.textContent.trim());
    if (!isNaN(number)) {
      numberElement.textContent = number.toLocaleString("en-US");
    }
  }
});

// ============== Display user data from Realtime Db ============== //
function displayUserData(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const firstname = userData.firstname || " User ";

        document.getElementById(
          "welcomeMessage"
        ).textContent = `Welcome, ${firstname}!`;
        const userDataDiv = document.querySelector(".user-info");
        userDataDiv.innerHTML = `
          <h3>👋Hello, ${firstname}!</h3>
        `;
        updateFundAmount(uid); // Update the displayed fund amount when user data is displayed
      }
    })
    .catch((error) => {
      console.error("Error retrieving user data: ", error);
    });
}

// ============== Logout Fx ================ //
logoutButton.addEventListener("click", () => {
  localStorage.clear(); // Clear the storage
  confirmationPopup.classList.add("show");
});

confirmYes.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      showPopup("Logged out successfully!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 5000);
    })
    .catch((error) => {
      console.error("Error logging out:", error);
      showPopup("Error logging out: " + error.message);
    });
  confirmationPopup.classList.remove("show");
});

confirmNo.addEventListener("click", () => {
  confirmationPopup.classList.remove("show");
});

const showPopup = (message) => {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  popupMessage.textContent = message;
  popup.classList.add("show");
};

const closePopup = () => {
  const popup = document.getElementById("popup");
  popup.classList.remove("show");
};

document.querySelector(".close").addEventListener("click", closePopup);
