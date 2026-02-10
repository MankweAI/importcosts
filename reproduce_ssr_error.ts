import "dotenv/config";
import { calculateLandedCost } from "./src/lib/calc/landedCost";

async function main() {
    console.log("Running reproduction script...");

    const input = {
        hsCode: "847130", // Laptops
        customsValue: 10000,
        invoiceValue: 10000,
        exchangeRate: 1,
        currency: "ZAR",
        originCountry: "US", // US -> ZA
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED" as const,
        freightCost: 1500,
        insuranceCost: 50,
        freightInsuranceCost: 1550,
        otherCharges: 0,
        quantity: 1,
        incoterm: "FOB" as const, // Fix: Case sensitive?
        usedGoods: false
    };

    try {
        const result = await calculateLandedCost(input, "ssr-repro");
        console.log("Calculation SUCCESS!");
        console.log("Total:", result.landedCostTotal);
    } catch (e: any) {
        console.error("Calculation FAILED!");
        console.error(e.message);
    }
}

main().then(() => process.exit(0));
