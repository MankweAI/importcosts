/**
 * interlinking.service.ts
 *
 * Server-side service for generating contextual internal links.
 * Queries the database for related pages to build a robust interlinking web.
 *
 * Strategy:
 *  - Cluster pages: resolve cluster → HS codes, then find pages sharing those HS codes
 *  - HS pages:      find pages sharing the same HS code
 *  - Both:          find pages from the same origin, and related HS codes in the same chapter
 */

import prisma from "@/lib/db/prisma";
import type { RouteContext } from "@/types/pseo";

export interface RelatedLink {
    label: string;
    href: string;
    description?: string;
}

export interface InterlinkingData {
    sameProductOtherOrigins: RelatedLink[];
    sameOriginOtherProducts: RelatedLink[];
    relatedHsCodes: RelatedLink[];
}

const BASE_PATH = "/import-duty-vat-landed-cost";

/**
 * Get related pages for interlinking.
 * Returns links grouped by relationship type.
 */
export async function getRelatedPages(routeContext: RouteContext): Promise<InterlinkingData> {
    const result: InterlinkingData = {
        sameProductOtherOrigins: [],
        sameOriginOtherProducts: [],
        relatedHsCodes: [],
    };

    try {
        const originUpper = routeContext.originIso.toUpperCase();

        // ─── Resolve the HS code(s) for this page ───
        let resolvedHsCodeIds: string[] = [];
        let resolvedHs6: string | null = routeContext.hs6;
        let clusterRecord: { id: string; name: string } | null = null;

        if (routeContext.clusterSlug) {
            const cluster = await prisma.productCluster.findUnique({
                where: { slug: routeContext.clusterSlug },
                select: { id: true, name: true, hsMaps: { select: { hsCodeId: true, hsCode: { select: { hs6: true } } }, take: 5, orderBy: { confidence: "desc" } } },
            });
            if (cluster) {
                clusterRecord = { id: cluster.id, name: cluster.name };
                resolvedHsCodeIds = cluster.hsMaps.map(m => m.hsCodeId);
                if (!resolvedHs6 && cluster.hsMaps.length > 0) {
                    resolvedHs6 = cluster.hsMaps[0].hsCode.hs6;
                }
            }
        }

        if (routeContext.hs6) {
            const hsRecord = await prisma.hsCode.findUnique({
                where: { hs6: routeContext.hs6 },
                select: { id: true },
            });
            if (hsRecord && !resolvedHsCodeIds.includes(hsRecord.id)) {
                resolvedHsCodeIds.push(hsRecord.id);
            }
        }

        // ─── 1. Same product/HS, different origins ───
        if (resolvedHsCodeIds.length > 0) {
            const pages = await prisma.seoPage.findMany({
                where: {
                    hsCodeId: { in: resolvedHsCodeIds },
                    originIso2: { not: originUpper },
                    indexStatus: "INDEX",
                },
                include: { origin: { select: { name: true, iso2: true } } },
                take: 6,
                orderBy: { readinessScore: "desc" },
            });

            const productLabel = clusterRecord?.name || `HS ${resolvedHs6}`;
            const hrefBase = routeContext.clusterSlug
                ? `${BASE_PATH}/${routeContext.clusterSlug}`
                : `${BASE_PATH}/hs/${routeContext.hs6}`;

            result.sameProductOtherOrigins = pages.map(p => ({
                label: `${productLabel} from ${p.origin.name}`,
                href: `${hrefBase}/from/${p.originIso2.toLowerCase()}/to/south-africa`,
                description: `Duty rates and landed cost from ${p.origin.name}`,
            }));
        } else if (clusterRecord) {
            // Fallback: find SeoPages linked directly to the cluster
            const pages = await prisma.seoPage.findMany({
                where: {
                    productClusterId: clusterRecord.id,
                    originIso2: { not: originUpper },
                    indexStatus: "INDEX",
                },
                include: { origin: { select: { name: true, iso2: true } } },
                take: 6,
                orderBy: { readinessScore: "desc" },
            });

            result.sameProductOtherOrigins = pages.map(p => ({
                label: `${clusterRecord!.name} from ${p.origin.name}`,
                href: `${BASE_PATH}/${routeContext.clusterSlug}/from/${p.originIso2.toLowerCase()}/to/south-africa`,
                description: `Duty rates and landed cost from ${p.origin.name}`,
            }));
        }

        // ─── 2. Same origin, different products ───
        // First try cluster-based pages
        const otherClusterPages = await prisma.seoPage.findMany({
            where: {
                originIso2: originUpper,
                productClusterId: { not: null },
                indexStatus: "INDEX",
                ...(clusterRecord
                    ? { productCluster: { slug: { not: routeContext.clusterSlug! } } }
                    : {}),
            },
            include: {
                productCluster: { select: { name: true, slug: true } },
                origin: { select: { name: true } },
            },
            take: 6,
            orderBy: { readinessScore: "desc" },
        });

        if (otherClusterPages.length > 0) {
            result.sameOriginOtherProducts = otherClusterPages
                .filter(p => p.productCluster)
                .map(p => ({
                    label: `${p.productCluster!.name} from ${p.origin.name}`,
                    href: `${BASE_PATH}/${p.productCluster!.slug}/from/${routeContext.originIso.toLowerCase()}/to/south-africa`,
                    description: `Import duty calculator for ${p.productCluster!.name}`,
                }));
        } else {
            // Fallback: find HS-based pages from the same origin
            const otherHsPages = await prisma.seoPage.findMany({
                where: {
                    originIso2: originUpper,
                    hsCodeId: resolvedHsCodeIds.length > 0
                        ? { notIn: resolvedHsCodeIds }
                        : undefined,
                    indexStatus: "INDEX",
                },
                include: {
                    hsCode: { select: { hs6: true, title: true } },
                    origin: { select: { name: true } },
                },
                take: 6,
                orderBy: { readinessScore: "desc" },
            });

            result.sameOriginOtherProducts = otherHsPages
                .filter(p => p.hsCode)
                .map(p => ({
                    label: `HS ${p.hsCode!.hs6} from ${p.origin.name}`,
                    href: `${BASE_PATH}/hs/${p.hsCode!.hs6}/from/${routeContext.originIso.toLowerCase()}/to/south-africa`,
                    description: p.hsCode!.title || `Duty rates for HS ${p.hsCode!.hs6}`,
                }));
        }

        // ─── 3. Related HS codes (same chapter) ───
        const chapterCode = resolvedHs6?.substring(0, 2);
        if (chapterCode) {
            const relatedHs = await prisma.hsCode.findMany({
                where: {
                    hs6: {
                        startsWith: chapterCode,
                        ...(resolvedHs6 ? { not: resolvedHs6 } : {}),
                    },
                },
                select: { hs6: true, title: true },
                take: 6,
                orderBy: { hs6: "asc" },
            });

            result.relatedHsCodes = relatedHs.map(hs => ({
                label: `HS ${hs.hs6}: ${hs.title}`,
                href: `${BASE_PATH}/hs/${hs.hs6}/from/${routeContext.originIso.toLowerCase()}/to/south-africa`,
                description: hs.title,
            }));
        }
    } catch (error) {
        console.error("[Interlinking] Failed to fetch related pages:", error);
    }

    return result;
}
