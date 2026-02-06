import prisma from "../db/prisma";

export type ValidationError = {
    hsCode: string;
    message: string;
};

export async function validateVersion(versionId: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    const rates = await prisma.tariffRate.findMany({
        where: { tariffVersionId: versionId },
        include: { hsCode: true },
    });

    if (rates.length === 0) {
        return [{ hsCode: "GLOBAL", message: "Version has no rates" }];
    }

    // Check for Duplicate HS Codes (should be prevented by DB constraints/logic but good to check)
    const hsMap = new Map<string, number>();
    for (const rate of rates) {
        const hs6 = rate.hsCode.hs6;
        hsMap.set(hs6, (hsMap.get(hs6) || 0) + 1);
    }

    for (const [hs6, count] of hsMap.entries()) {
        if (count > 1) {
            errors.push({ hsCode: hs6, message: `Duplicate HS code found ${count} times` });
        }
    }

    for (const rate of rates) {
        const hs6 = rate.hsCode.hs6;

        // 1. Check Duty Type Validity
        if (!rate.dutyType) {
            errors.push({ hsCode: hs6, message: "Missing duty type" });
            continue;
        }

        // 2. Check Ad Valorem
        if (rate.dutyType === "AD_VALOREM" || rate.dutyType === "COMPOUND") {
            if (rate.adValoremPct === null || rate.adValoremPct === undefined) {
                errors.push({ hsCode: hs6, message: "Ad Valorem rate missing percentage" });
            }
        }

        // 3. Check Specific Rate
        if ((rate.dutyType === "SPECIFIC" || rate.dutyType === "COMPOUND") && !rate.specificRule) {
            errors.push({ hsCode: hs6, message: "Specific rate missing rule definition" });
        }

        // 4. Check JSON structure for Specific Rule if present
        if (rate.specificRule) {
            // cast to any to check properties
            const rule = rate.specificRule as any;
            if (!rule.rate || !rule.unit) {
                errors.push({ hsCode: hs6, message: "Specific rule incomplete (needs rate and unit)" });
            }
        }
    }

    return errors;
}
