const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config();

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "chrome-extension://mnbalkhnikjhhbkjdniopgadipbiedki",
  "https://phishing-detector-frontend-olive.vercel.app",
  "https://web.whatsapp.com",
  "https://www.google.com"
];

// ✅ CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.startsWith("chrome-extension://") ||
      origin === "null" ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("❌ Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));


// ✅ Google Safe Browsing API
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SAFE_BROWSING_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

// ✅ Dataset Check
async function checkInDataset(url) {
  const cleanUrl = url.trim();
  if (dataset.has(cleanUrl)) {
    const label = dataset.get(cleanUrl).trim();
    console.log("✅ Found in dataset:", cleanUrl, "=>", label);
    return label === "1.0" ? "phishing" : "safe";
  }
  return null;
}

// ✅ Google Safe Browsing Check
async function checkGoogleSafeBrowsing(url) {
  const requestBody = {
    client: { clientId: "phishing-detector", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await axios.post(GOOGLE_SAFE_BROWSING_URL, requestBody);
    if (response.data.matches) {
      console.log("🚨 Google Safe Browsing detected phishing:", url);
      return "phishing";
    } else {
      console.log("✅ Google Safe Browsing: Safe");
      return "safe";
    }
  } catch (error) {
    console.error("❌ Google Safe Browsing error:", error.message);
    return "Error";
  }
}

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("🌐 Phishing Detector Backend is running.");
});

// ✅ Predict Route
app.post("/predict", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cleanUrl = url.trim();
  console.log("🔍 Checking URL:", cleanUrl);

  let prediction = await checkInDataset(cleanUrl);

  if (!prediction) {
    console.log("❌ Not found in dataset. Checking with Google Safe Browsing...");
    prediction = await checkGoogleSafeBrowsing(cleanUrl);
  }

  if (prediction === "Error") {
    prediction = "unknown";
  }

  return res.json({
    url: cleanUrl,
    prediction,
    source:
      prediction === "phishing"
        ? "Google Safe Browsing"
        : prediction === "safe"
        ? "Google Safe Browsing or Dataset"
        : "Unknown"
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
