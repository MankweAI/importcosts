import { PlanTier } from "@prisma/client";
import prisma from "@/lib/db/prisma";

export type Feature =
    | "create_calc_run"
    | "export_pdf"
    | "export_csv"
    | "compare_scenarios"
    | "watchlist"
    | "create_org"
    | "view_trends";

export const TIER_LIMITS = {
    [PlanTier.FREE]: {
        maxSavedCalcs: 3,
        canExportPdf: false,
        canExportCsv: false,
        canCompareScenarios: false,
        canWatchlist: false,
        canCreateOrg: false,
    },
    [PlanTier.SME]: {
        maxSavedCalcs: Infinity,
        canExportPdf: true,
        canExportCsv: true,
        canCompareScenarios: true,
        canWatchlist: true,
        canCreateOrg: false,
    },
    [PlanTier.PRO]: {
        maxSavedCalcs: Infinity,
        canExportPdf: true,
        canExportCsv: true,
        canCompareScenarios: true,
        canWatchlist: true,
        canCreateOrg: true,
    },
    [PlanTier.ENTERPRISE]: {
        maxSavedCalcs: Infinity,
        canExportPdf: true,
        canExportCsv: true,
        canCompareScenarios: true,
        canWatchlist: true,
        canCreateOrg: true,
    },
};

export async function getUserUsage(userId: string) {
    const savedCount = await prisma.calcRun.count({
        where: { userId },
    });

    // In future, fetch actual subscription tier from DB/Stripe
    // For MVP, everyone starts on FREE
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true }
    });

    const tier = user?.subscriptions[0]?.tier || PlanTier.FREE;

    return { savedCount, tier };
}

export async function checkGate(userId: string, feature: Feature): Promise<{ allowed: boolean; reason?: string }> {
    const { savedCount, tier } = await getUserUsage(userId);
    const limits = TIER_LIMITS[tier];

    switch (feature) {
        case "create_calc_run":
            if (savedCount >= limits.maxSavedCalcs) {
                return {
                    allowed: false,
                    reason: `Free tier limited to ${limits.maxSavedCalcs} saved calculations. Upgrade to save more.`
                };
            }
            return { allowed: true };

        case "export_pdf":
            if (!limits.canExportPdf) {
                return {
                    allowed: false,
                    reason: "PDF Export is available on SME plan and above."
                };
            }
            return { allowed: true };
        case "export_csv":
            if (!limits.canExportCsv) {
                return {
                    allowed: false,
                    reason: "CSV Export is available on SME plan and above."
                };
            }
            return { allowed: true };
        case "compare_scenarios":
            if (!limits.canCompareScenarios) {
                return {
                    allowed: false,
                    reason: "Scenario comparison is available on SME plan and above."
                };
            }
            return { allowed: true };
        case "watchlist":
            if (!limits.canWatchlist) {
                return {
                    allowed: false,
                    reason: "Watchlist alerts are available on SME plan and above."
                };
            }
            return { allowed: true };

        case "create_org":
            if (!limits.canCreateOrg) {
                return {
                    allowed: false,
                    reason: "Organization management is a Pro feature."
                };
            }
            return { allowed: true };

        default:
            return { allowed: false, reason: "Unknown feature" };
    }
}
