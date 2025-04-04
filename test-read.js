const fs = require("fs");

fs.readFile("urlset.csv", "utf8", (err, data) => {
    if (err) {
        console.error("❌ Error reading file:", err.message);
        return;
    }
    console.log("✅ First 500 characters of file:\n", data.slice(0, 500));
});
