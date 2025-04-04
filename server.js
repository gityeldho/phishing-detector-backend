const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dataset = new Map(); // Store dataset in memory

// ✅ Load dataset from urlset.csv


fs.createReadStream("urlset.csv")
  .pipe(csvParser())
  .on("data", (row) => {
    if (row.domain && row.label !== undefined) {
      const domain = row.domain.trim();
      const label = row.label.trim();
      dataset.set(domain, label);
    }
  })
  .on("end", () => {
    console.log(`✅ Dataset loaded successfully with ${dataset.size} entries.`);
  })
  .on("error", (err) => {
    console.error("❌ Error loading dataset:", err.message);
  });

// ✅ Google Safe Browsing API Setup (if you decide to re-enable it in the future)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SAFE_BROWSING_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

// Step 1: Check in local dataset
async function checkInDataset(url) {
  const cleanUrl = url.trim();
  
  if (dataset.has(cleanUrl)) {
    const label = dataset.get(cleanUrl).trim();  // Ensure no extra spaces
    console.log("✅ Found in dataset:", cleanUrl, "=>", label);
    return label === "1.0" ? "Phishing" : "safe";
  }
  
  return null;  // Return null if not found in the dataset
}

// Step 2: Check Google Safe Browsing if not in the dataset
async function checkGoogleSafeBrowsing(url) {
  const requestBody = {
    client: {
      clientId: "phishing-detector",
      clientVersion: "1.0",
    },
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
      return "safe";
    } else {
      console.log("✅ Google Safe Browsing: phishing");
      return "phishing";
    }
  } catch (error) {
    console.error("❌ Error calling Google Safe Browsing API:", error.message);
    return "Error";
  }
}

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("🌐 Phishing Detector Backend is running.");
});

// ✅ Prediction Route
app.post("/predict", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cleanUrl = url.trim();
  console.log("🔍 Checking URL:", cleanUrl);

  // Step 1: Check in local dataset
  let prediction = await checkInDataset(cleanUrl);

  // Step 2: If not found in dataset, check using Google Safe Browsing
  if (!prediction) {
    console.log("❌ Not found in dataset. Checking with Google Safe Browsing...");
    prediction = await checkGoogleSafeBrowsing(cleanUrl);
  }

  // Return the result
  return res.json({
    url: cleanUrl,
    prediction,
    source: prediction === "Error" ? "Backend" : prediction === "phishing" ? "Google Safe Browsing" : "Dataset",
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
