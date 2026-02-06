import prisma from "../db/prisma";
import type { Prisma } from "@prisma/client";

export type RateChange = {
    hs6: string;
    type: "ADDED" | "REMOVED" | "CHANGED";
    oldRate?: string;
    newRate?: string;
};

export type VersionDiff = {
    oldVersionId: string;
    newVersionId: string;
    changes: RateChange[];
    stats: {
        added: number;
        removed: number;
        changed: number;
        unchanged: number;
    };
};

function formatRate(rate: any): string {
    if (!rate) return "N/A";
    let parts = [];
    if (rate.dutyType) parts.push(rate.dutyType);
    if (rate.adValoremPct !== null) parts.push(`${rate.adValoremPct}%`);
    if (rate.specificRule) {
        const rule = rate.specificRule as any;
        parts.push(`Specific: ${rule.rate}/${rule.unit}`);
    }
    return parts.join(" ");
}

export async function compareVersions(
    oldVersionId: string,
    newVersionId: string
): Promise<VersionDiff> {
    const oldRates = await prisma.tariffRate.findMany({
        where: { tariffVersionId: oldVersionId },
        include: { hsCode: true },
    });

    const newRates = await prisma.tariffRate.findMany({
        where: { tariffVersionId: newVersionId },
        include: { hsCode: true },
    });

    const oldMap = new Map(oldRates.map((r) => [r.hsCode.hs6, r]));
    const newMap = new Map(newRates.map((r) => [r.hsCode.hs6, r]));

    const changes: RateChange[] = [];
    let added = 0;
    let removed = 0;
    let changed = 0;
    let unchanged = 0;

    // Check for Removed and Changed
    for (const [hs6, oldRate] of oldMap) {
        const newRate = newMap.get(hs6);

        if (!newRate) {
            changes.push({
                hs6,
                type: "REMOVED",
                oldRate: formatRate(oldRate),
            });
            removed++;
        } else {
            // Simplistic equality check
            const oldStr = formatRate(oldRate);
            const newStr = formatRate(newRate);

            if (oldStr !== newStr) {
                changes.push({
                    hs6,
                    type: "CHANGED",
                    oldRate: oldStr,
                    newRate: newStr,
                });
                changed++;
            } else {
                unchanged++;
            }
        }
    }

    // Check for Added
    for (const [hs6, newRate] of newMap) {
        if (!oldMap.has(hs6)) {
            changes.push({
                hs6,
                type: "ADDED",
                newRate: formatRate(newRate),
            });
            added++;
        }
    }

    return {
        oldVersionId,
        newVersionId,
        changes,
        stats: { added, removed, changed, unchanged },
    };
}
