// Function to collect visitor data
async function collectVisitorData() {
  try {
    // Fetch IP and location data
    const ipResponse = await fetch("https://ipapi.co/json/");
    const ipData = await ipResponse.json();

    // Detect device model using userAgent
    const userAgent = navigator.userAgent;
    let deviceModel = "Unknown Device";

    if (/android/i.test(userAgent)) {
      deviceModel = "Android";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      deviceModel = "iOS";
    } else if (/Windows/.test(userAgent)) {
      deviceModel = "Windows Device";
    } else if (/Mac/.test(userAgent)) {
      deviceModel = "MacOS Device";
    } else if (/Linux/.test(userAgent)) {
      deviceModel = "Linux Device";
    }

    // Validate collected data
    const ip = ipData.ip || "N/A";
    const location =
      ipData.region && ipData.country_name
        ? `${ipData.region}, ${ipData.country_name}`
        : "N/A";

    if (
      ip === "N/A" ||
      location === "N/A" ||
      deviceModel === "Unknown Device"
    ) {
      throw new Error("Incomplete visitor data detected");
    }

    return { ip, location, device: deviceModel };
  } catch (error) {
    console.error("Error collecting visitor data:", error);
    return null; // Return null to indicate failure
  }
}

// Send visitor data when the website is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Retrieve stored visitor data and timestamp
    const storedData = localStorage.getItem("visitorData");
    const storedTimestamp = localStorage.getItem("visitorDataTimestamp");

    // Define expiration time (e.g., 1 hour)
    const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

    // If data exists and it has not expired, skip sending email
    if (storedData && storedTimestamp) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - storedTimestamp;

      // If data has not expired, compare the stored data with the current data
      if (timeElapsed < expirationTime) {
        console.log(
          "Visitor data already sent within the last hour; skipping duplicate email."
        );
        return;
      }
    }

    const visitorData = await collectVisitorData();

    // Abort if visitor data retrieval failed
    if (!visitorData) {
      console.warn("Visitor data is incomplete or invalid; email not sent.");
      return;
    }

    // Check if the current visitor data is identical to the previously stored data
    const currentVisitorDataString = JSON.stringify(visitorData);
    if (storedData === currentVisitorDataString) {
      console.log("Duplicate visitor data detected; skipping email.");
      return;
    }

    const params = {
      LOCATION: visitorData.location,
      IP_ADDRESS: visitorData.ip,
      DEVICE_MODEL: visitorData.device,
    };

    const serviceID = "service_lorebim";
    const templateID = "template_zqywky7";

    // Send email using EmailJS
    await emailjs.send(serviceID, templateID, params);
    console.log("Visitor details email sent successfully");

    // Store visitor data and timestamp in localStorage to prevent duplicate sending
    localStorage.setItem("visitorData", currentVisitorDataString);
    localStorage.setItem("visitorDataTimestamp", Date.now().toString());
  } catch (err) {
    console.error("Error sending visitor details email:", err);
  }
});

// Clear browser cache suggestion
console.log(
  "If you are facing cache issues, clear your browser cache and reload the page."
);
