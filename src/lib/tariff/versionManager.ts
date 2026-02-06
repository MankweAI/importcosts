import prisma from "../db/prisma";
import { validateVersion } from "./qualityChecks";
import { setActiveTariffVersion } from "../db/services/tariff.service";

export type PublishResult = {
    success: boolean;
    errors: string[];
};

export async function publishVersion(versionId: string): Promise<PublishResult> {
    // 1. Run Data Quality Checks
    const validationErrors = await validateVersion(versionId);

    if (validationErrors.length > 0) {
        return {
            success: false,
            errors: validationErrors.map((e) => `[${e.hsCode}] ${e.message}`),
        };
    }

    // 2. Set Active
    try {
        await setActiveTariffVersion(versionId);

        // Update publishedAt
        await prisma.tariffVersion.update({
            where: { id: versionId },
            data: { publishedAt: new Date() }
        });

        return { success: true, errors: [] };
    } catch (e: any) {
        return { success: false, errors: [e.message] };
    }
}

export async function getVersionHistory() {
    const versions = await prisma.tariffVersion.findMany({
        orderBy: { effectiveFrom: "desc" },
        include: {
            _count: {
                select: { rates: true },
            },
        },
    });

    return versions.map((v) => ({
        id: v.id,
        label: v.label,
        effectiveFrom: v.effectiveFrom,
        publishedAt: v.publishedAt,
        isActive: v.isActive,
        rateCount: v._count.rates,
    }));
}
