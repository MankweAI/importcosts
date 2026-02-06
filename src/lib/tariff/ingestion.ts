import { TariffRow, parseTariffCsv } from "./csvParser";
import { createTariffVersion, addTariffRate } from "../db/services/tariff.service";
import { upsertHsCode } from "../db/services/hsCode.service";
import { DutyType } from "@prisma/client";

export type IngestionResult = {
    versionId: string;
    totalRates: number;
    newHsCodes: number;
    errors: string[];
};

export async function ingestTariffCsv(
    filepath: string,
    label: string,
    effectiveFrom: Date
): Promise<IngestionResult> {
    const errors: string[] = [];
    let newHsCodes = 0;
    let totalRates = 0;

    // 1. Parse CSV
    let rows: TariffRow[];
    try {
        rows = parseTariffCsv(filepath);
    } catch (e: any) {
        throw new Error(`Failed to parse CSV: ${e.message}`);
    }

    // 2. Create Tariff Version
    const version = await createTariffVersion({
        label,
        effectiveFrom,
        isActive: false, // Always inactive by default
    });

    // 3. Process Rows
    for (const row of rows) {
        try {
            // Ensure HS Code exists
            const hsCode = await upsertHsCode({
                hs6: row.hs6,
                title: `HS ${row.hs6}`, // Placeholder title if new
            });

            // Track if it was effectively new (this is a rough heuristic, 
            // upsert doesn't tell us, but good enough for stats)
            // In a real scenario we might query first.

            // Construct rule objects
            let specificRule = undefined;
            if (row.dutyType === "SPECIFIC" || row.dutyType === "COMPOUND") {
                if (row.specificRate !== undefined && row.specificUnit) {
                    specificRule = {
                        rate: row.specificRate,
                        unit: row.specificUnit
                    };
                }
            }

            // Add Rate
            await addTariffRate({
                tariffVersionId: version.id,
                hsCodeId: hsCode.id,
                dutyType: row.dutyType,
                adValoremPct: row.adValoremPct,
                specificRule: specificRule,
                notes: row.notes,
            });

            totalRates++;
        } catch (e: any) {
            errors.push(`Row HS ${row.hs6}: ${e.message}`);
        }
    }

    return {
        versionId: version.id,
        totalRates,
        newHsCodes, // TODO: Implement accurate tracking if needed
        errors,
    };
}
