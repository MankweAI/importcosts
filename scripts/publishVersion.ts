/**
 * Publish Version Script
 * Usage: npx ts-node scripts/publishVersion.ts --id <versionId>
 */

import "dotenv/config";
import { publishVersion, getVersionHistory } from "../src/lib/tariff/versionManager";
import { parseArgs } from "util";

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            id: { type: "string" },
            list: { type: "boolean" },
        },
    });

    if (values.list) {
        const history = await getVersionHistory();
        console.table(history);
        return;
    }

    if (!values.id) {
        console.error("Usage: npx ts-node scripts/publishVersion.ts --id <versionId> OR --list");
        process.exit(1);
    }

    console.log(`Publishing version: ${values.id}`);

    try {
        const result = await publishVersion(values.id);

        if (result.success) {
            console.log("✅ Version successfully published and set to ACTIVE.");
        } else {
            console.error("❌ Version publication FAILED due to quality checks:");
            result.errors.forEach(e => console.error(`- ${e}`));
            process.exit(1);
        }
    } catch (e: any) {
        console.error("Publication Failed:", e.message);
        process.exit(1);
    }
}

main();
