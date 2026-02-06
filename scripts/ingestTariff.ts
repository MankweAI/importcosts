/**
 * Ingest Tariff Script
 * Usage: npx ts-node scripts/ingestTariff.ts --file <path> --label <label>
 */

import "dotenv/config";
import { ingestTariffCsv } from "../src/lib/tariff/ingestion";
import { parseArgs } from "util";
import path from "path";

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            file: { type: "string" },
            label: { type: "string" },
        },
    });

    if (!values.file || !values.label) {
        console.error("Usage: npx ts-node scripts/ingestTariff.ts --file <path> --label <label>");
        process.exit(1);
    }

    const absolutePath = path.resolve(values.file);
    console.log(`Reading from: ${absolutePath}`);

    try {
        const result = await ingestTariffCsv(
            absolutePath,
            values.label,
            new Date()
        );

        console.log("Ingestion Complete!");
        console.log(`Version ID: ${result.versionId}`);
        console.log(`Total Rates: ${result.totalRates}`);
        console.log(`New HS Codes: ${result.newHsCodes}`);

        if (result.errors.length > 0) {
            console.warn("\nValidation Errors:");
            result.errors.forEach(e => console.warn(`- ${e}`));
        }
    } catch (e: any) {
        console.error("Ingestion Failed:", e.message);
        process.exit(1);
    }
}

main();
