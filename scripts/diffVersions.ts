/**
 * Diff Versions Script
 * Usage: npx ts-node scripts/diffVersions.ts --old <id> --new <id>
 */

import "dotenv/config";
import { compareVersions } from "../src/lib/tariff/versionDiff";
import { getVersionHistory } from "../src/lib/tariff/versionManager";
import { parseArgs } from "util";

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            old: { type: "string" },
            new: { type: "string" },
            list: { type: "boolean" },
        },
    });

    if (values.list) {
        const history = await getVersionHistory();
        console.table(history);
        return;
    }

    if (!values.old || !values.new) {
        console.error("Usage: npx ts-node scripts/diffVersions.ts --old <id> --new <id> OR --list");
        process.exit(1);
    }

    console.log(`Diffing: ${values.old} -> ${values.new}`);

    try {
        const diff = await compareVersions(values.old, values.new);

        console.log("\nStatistics:");
        console.table(diff.stats);

        if (diff.changes.length > 0) {
            console.log("\nDetailed Changes:");
            // Limit output to avoid spamming console
            const displayChanges = diff.changes.length > 20
                ? diff.changes.slice(0, 20)
                : diff.changes;

            console.table(displayChanges.map(c => ({
                HS: c.hs6,
                Type: c.type,
                Old: c.oldRate || "-",
                New: c.newRate || "-"
            })));

            if (diff.changes.length > 20) {
                console.log(`... and ${diff.changes.length - 20} more changes.`);
            }
        } else {
            console.log("No changes detected.");
        }

    } catch (e: any) {
        console.error("Diff Failed:", e.message);
        process.exit(1);
    }
}

main();
