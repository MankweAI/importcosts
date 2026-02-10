const http = require('http');

const inputData = JSON.stringify({
    invoiceValue: 10000,
    exchangeRate: 18.5,
    freightCost: 1000,
    insuranceCost: 100,
    quantity: 1,
    importerType: "VAT_REGISTERED",
    originCountry: "CN",
    hsCode: "847130"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/rate-hunter',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': inputData.length }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log("=== INSIGHT ===");
        console.log("Type:", json.insight.type);
        console.log("Headline:", json.insight.headline);
        console.log("Explanation:", json.insight.explanation);
        console.log("Origins checked:", json.insight.originsChecked);
        if (json.insight.comparison) {
            console.log("\n=== COMPARISON ===");
            console.log("Current:", json.insight.comparison.current.label, "-> R", json.insight.comparison.current.landedCost);
            console.log("Better:", json.insight.comparison.better.label, "-> R", json.insight.comparison.better.landedCost);
            console.log("Savings:", "R", json.insight.comparison.better.savingsAmount);
        }
    });
});
req.write(inputData);
req.end();
