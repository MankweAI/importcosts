
import "dotenv/config";
import { calculateLandedCost } from "../src/lib/calc/landedCost";
import { CalcInput } from "../src/lib/calc/types";

async function main() {
    console.log("🧪 Verifying Calculation Logic (Fixing '650' Bug)...");

    const input: CalcInput = {
        hsCode: "87032390", // Vehicle
        customsValue: 100000, // R100k
        invoiceValue: 100000,
        exchangeRate: 1.0, // Already ZAR
        originCountry: "DE",
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED",
        freightCost: 15000,
        insuranceCost: 500,
        freightInsuranceCost: 15500,
        quantity: 1,
        incoterm: "FOB",
        usedGoods: false
    };

    console.log("\nInput Value:", input.customsValue);

    const result = await calculateLandedCost(input, "verify-script");

    console.log("\n📊 Breakdown:");
    result.breakdown.forEach(item => {
        console.log(`   - ${item.label}: R ${item.amount.toFixed(2)}`);
    });

    console.log("\n💰 Total Landed Cost:", result.landedCostTotal.toFixed(2));

    // Check Ancillary specifically
    const ancillary = result.breakdown.filter(i => ["agency_fee", "disbursements", "port_dues", "forex_fees"].includes(i.id));
    const ancillaryTotal = ancillary.reduce((sum, i) => sum + i.amount, 0);

    console.log("\n🔎 Ancillary Fees Total:", ancillaryTotal.toFixed(2));

    if (ancillaryTotal > 650) {
        console.log("✅ SUCCESS: Ancillary fees are dynamic and > 650.");
    } else {
        console.log("❌ FAIL: Ancillary fees are still low/hardcoded?");
    }
}

main().catch(console.error);
