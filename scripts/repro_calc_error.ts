
import { CalcInputSchema } from "../src/lib/calc/schemas";

async function main() {
    const payload = {
        hsCode: "854143",
        customsValue: 0,
        originCountry: "China",
        destinationCountry: "ZA",
        importerType: "VAT_REGISTERED",
        quantity: 1,
        incoterm: "CIF",
        freightInsuranceCost: undefined
    };

    console.log("Testing payload:", payload);

    try {
        CalcInputSchema.parse(payload);
        console.log("✅ Validation Passed");
    } catch (e: any) {
        console.log("❌ Validation Failed:");
        console.log(JSON.stringify(e.issues, null, 2));
    }
}

main();
