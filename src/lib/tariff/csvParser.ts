import { parse } from "csv-parse/sync";
import { z } from "zod";
import { DutyType } from "@prisma/client";
import fs from "fs";

export const TariffRowSchema = z.object({
    hs6: z.string().regex(/^\d{6}$/, "HS code must be 6 digits"),
    dutyType: z.nativeEnum(DutyType),
    adValoremPct: z.coerce.number().min(0).max(100).optional(),
    specificRate: z.coerce.number().min(0).optional(),
    specificUnit: z.string().optional(),
    notes: z.string().optional(),
});

export type TariffRow = z.infer<typeof TariffRowSchema>;

export function parseTariffCsv(filepath: string): TariffRow[] {
    const fileContent = fs.readFileSync(filepath, "utf-8");

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    return records.map((record: any, index: number) => {
        // Map FREE to AD_VALOREM if needed
        if (record.dutyType === "FREE") {
            record.dutyType = "AD_VALOREM";
            if (!record.adValoremPct) record.adValoremPct = "0";
        }

        // Handle empty strings as undefined for optional fields
        const cleanRecord = Object.fromEntries(
            Object.entries(record).map(([k, v]) => [k, v === "" ? undefined : v])
        );

        const result = TariffRowSchema.safeParse(cleanRecord);

        if (!result.success) {
            console.error("Zod Error:", JSON.stringify(result.error, null, 2));
            throw new Error(
                `Row ${index + 2} validation error: ` + (result.error as any).issues?.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ") || "Unknown validation error"
            );
        }

        return result.data;
    });
}
