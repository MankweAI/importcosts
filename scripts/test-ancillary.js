
const { calculateLandedCost } = require('../src/lib/calc/landedCost');
const { calculateAncillary } = require('../src/lib/calc/ancillary');

// Mock Input
const input = {
    hsCode: "8501.10", // Dummy HS
    customsValue: 100000, // R100k
    quantity: 1,
    incoterm: "CIF"
};

async function test() {
    console.log("Testing Ancillary Logic directly...");
    const directResult = calculateAncillary(input, 100000);
    console.log("Direct Result Total:", directResult.total);
    console.log("Items:", directResult.items.map(i => i.id));

    // We can't easily test calculateLandedCost without DB mock for Tariff Version/HS Code.
    // So we rely on the unit test of logic above + code review.

    if (directResult.items.find(i => i.id === 'forex_fees') && directResult.total > 0) {
        console.log("SUCCESS: Ancillary items generated.");
    } else {
        console.error("FAILURE: No ancillary items.");
        process.exit(1);
    }
}

test();
