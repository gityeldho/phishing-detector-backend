const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config();

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  "chrome-extension://mnbalkhnikjhhbkjdniopgadipbiedki",
  "https://phishing-detector-frontend-olive.vercel.app"
];

// ✅ Apply CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

app.use(express.json());

// ✅ Load dataset from CSV
const dataset = new Map();

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
    console.log(`✅ Dataset loaded with ${dataset.size} entries.`);
  })
  .on("error", (err) => {
    console.error("❌ Error loading dataset:", err.message);
  });

// ✅ Google Safe Browsing API Setup
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SAFE_BROWSING_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

// Step 1: Check in local dataset
async function checkInDataset(url) {
  const cleanUrl = url.trim();
  if (dataset.has(cleanUrl)) {
    const label = dataset.get(cleanUrl).trim();
    console.log("✅ Found in dataset:", cleanUrl, "=>", label);
    return label === "1.0" ? "phishing" : "safe";
  }
  return null;
}

// Step 2: Check Google Safe Browsing
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

// Home route
app.get("/", (req, res) => {
  res.send("🌐 Phishing Detector Backend is running.");
});

// Prediction route
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

// ✅ Start Server for Deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
