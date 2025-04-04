const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('urlset.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (!row.domain) {
      console.error("❌ Missing domain field:", row);
      return; // Skip this row
    }
    try {
      const domain = row.domain.split("/")[0];
      console.log("🔍 Processed Domain:", domain);
    } catch (error) {
      console.error("❌ Error processing row:", row, error);
    }
  })
  .on('end', () => {
    console.log('✅ CSV file successfully processed.');
  });
