const fs = require("fs");
const csvParser = require("csv-parser");

const phishingUrls = [];
let printedCount = 0;
const maxToPrint = 20;

fs.createReadStream("urlset.csv")
  .pipe(csvParser())
  .on("data", (row) => {
    if (printedCount < maxToPrint) {
      const url = row.domain?.trim();
      const label = row.label?.trim();

      if (label === "1.0" && url) {
        phishingUrls.push(url);
        printedCount++;
        console.log(`${printedCount}. ${url}`);
      }
    }
  })
  .on("end", () => {
    console.log("\n✅ Done printing first 20 phishing URLs.");
  })
  .on("error", (err) => {
    console.error("❌ Error reading CSV file:", err.message);
  });

