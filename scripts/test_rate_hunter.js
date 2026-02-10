
const http = require('http');

const inputData = JSON.stringify({
    invoiceValue: 10000,
    exchangeRate: 18.5,
    freightCost: 1000,
    insuranceCost: 100,
    quantity: 1,
    importerType: "VAT_REGISTERED",
    originCountry: "CN",
    hsCode: "847130" // Laptops from China
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/rate-hunter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': inputData.length
    }
};

console.log("Testing Smart Rate Hunter for Laptops (China)...");

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const json = JSON.parse(data);
                console.log("API Success!");
                console.log("Base Origin:", json.baseOrigin);
                console.log("Alternatives Found:", json.alternatives.length);

                if (json.bestAlternative) {
                    console.log("Best Alternative:", json.bestAlternative.originLabel);
                    console.log("Savings:", json.bestAlternative.savingsVsBase);
                    console.log("Document Friction:", json.bestAlternative.frictionLevel);
                } else {
                    console.log("No better alternatives found (as expected for laptops often).");
                }

                // Log the matrix
                console.log("\n--- Comparison Matrix ---");
                json.alternatives.forEach(a => {
                    console.log(`${a.originIso}: R${a.landedCostTotal.toFixed(0)} (Duty: ${a.dutyRate}) - Savings: R${a.savingsVsBase.toFixed(0)}`);
                });

            } catch (e) {
                console.error("Failed to parse JSON:", e);
                console.log("Raw Body:", data);
            }
        } else {
            console.error("Request Failed:", res.statusCode);
            console.log("Body:", data);
        }
    });
});

req.on('error', (error) => {
    console.error("Error:", error);
});

req.write(inputData);
req.end();
