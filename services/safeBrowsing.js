const axios = require("axios");

const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

exports.checkURL = async (url) => {
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
        const response = await axios.post(API_URL, requestBody);
        return response.data.matches ? true : false;
    } catch (error) {
        console.error("Safe Browsing API error:", error);
        return false;
    }
};
