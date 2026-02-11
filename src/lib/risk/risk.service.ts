import prisma from "@/lib/db/prisma";
import { RiskSeverity, RiskCategory, RiskTriggerType } from "@prisma/client";

export interface RiskFlag {
    title: string;
    description: string;
    severity: RiskSeverity;
    category: RiskCategory;
    mitigation?: string | null;
}

export interface RiskContext {
    hsCode?: string;
    clusterSlug?: string;
    originIso?: string;
}

export async function getRiskFlags(context: RiskContext): Promise<RiskFlag[]> {
    const { hsCode, clusterSlug, originIso } = context;

    // We want to find rules that match ANY of the context provided.
    // 1. HS Code Prefix matching (e.g. if HS is 850440, match 85, 8504, 850440)
    // 2. Cluster Slug matching
    // 3. Origin ISO matching
    // 4. Generic matching (global risks)

    const conditions: any[] = [
        { triggerType: RiskTriggerType.GENERIC }
    ];

    if (clusterSlug) {
        conditions.push({
            triggerType: RiskTriggerType.CLUSTER_SLUG,
            triggerValue: clusterSlug
        });
    }

    if (originIso) {
        conditions.push({
            triggerType: RiskTriggerType.ORIGIN_ISO,
            triggerValue: originIso.toUpperCase()
        });
    }

    if (hsCode) {
        // Generate prefixes: 2, 4, 6 chars
        const prefixes = [
            hsCode.substring(0, 2),
            hsCode.substring(0, 4),
            hsCode.substring(0, 6)
        ].filter(p => p.length >= 2);

        conditions.push({
            triggerType: RiskTriggerType.HS_CODE_PREFIX,
            triggerValue: { in: prefixes }
        });
    }

    const rules = await prisma.riskRule.findMany({
        where: {
            OR: conditions
        },
        orderBy: {
            severity: 'desc' // Critical first
        }
    });

    return rules.map(rule => ({
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        category: rule.category,
        mitigation: rule.mitigation
    }));
}
