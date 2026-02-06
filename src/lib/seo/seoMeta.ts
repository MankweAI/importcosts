/**
 * SEO Meta Builder
 * 
 * Combines index policy, canonical, and metadata to produce complete SEO config.
 */

import { IndexStatus, PageType } from "@prisma/client";
import { Metadata } from "next";
import {
    evaluateIndexCriteria,
    getRobotsDirective,
    type PageIndexData
} from "./indexPolicy";
import { getCanonicalUrl, hasExternalCanonical } from "./canonical";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "ImportCosts";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za";

export type SeoPageInput = {
    slug: string;
    pageType: PageType;
    indexStatus: IndexStatus;
    canonicalSlug: string | null;
    readinessScore: number;

    // Page content info
    title: string;
    description: string;
    productClusterName?: string;
    originCountryName?: string;
    destCountryName?: string;

    // Index evaluation data
    hasHsCandidates: boolean;
    hasTariffRates: boolean;
    hasDocChecklist: boolean;
    hasRiskFlags: boolean;
    internalLinksCount: number;
    hasComputedScenarios: boolean;
};

export type SeoMeta = {
    title: string;
    description: string;
    canonicalUrl: string;
    robotsDirective: string;
    shouldIndex: boolean;
    blockerReasons: string[];
    openGraph: {
        title: string;
        description: string;
        url: string;
        siteName: string;
        type: string;
    };
};

/**
 * Build complete SEO metadata for a page
 */
export function buildSeoMeta(page: SeoPageInput): SeoMeta {
    // Evaluate indexation criteria
    const indexData: PageIndexData = {
        indexStatus: page.indexStatus,
        readinessScore: page.readinessScore,
        hasHsCandidates: page.hasHsCandidates,
        hasTariffRates: page.hasTariffRates,
        hasDocChecklist: page.hasDocChecklist,
        hasRiskFlags: page.hasRiskFlags,
        internalLinksCount: page.internalLinksCount,
        hasComputedScenarios: page.hasComputedScenarios,
        canonicalSlug: page.canonicalSlug,
    };

    const indexDecision = evaluateIndexCriteria(indexData);
    const canonicalUrl = getCanonicalUrl({
        slug: page.slug,
        canonicalSlug: page.canonicalSlug,
        pageType: page.pageType,
    });

    return {
        title: page.title,
        description: page.description,
        canonicalUrl,
        robotsDirective: indexDecision.robotsDirective,
        shouldIndex: indexDecision.shouldIndex,
        blockerReasons: indexDecision.blockerReasons,
        openGraph: {
            title: page.title,
            description: page.description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            type: "website",
        },
    };
}

/**
 * Convert SeoMeta to Next.js Metadata format
 */
export function toNextMetadata(seoMeta: SeoMeta): Metadata {
    return {
        title: seoMeta.title,
        description: seoMeta.description,
        alternates: {
            canonical: seoMeta.canonicalUrl,
        },
        robots: seoMeta.robotsDirective,
        openGraph: {
            title: seoMeta.openGraph.title,
            description: seoMeta.openGraph.description,
            url: seoMeta.openGraph.url,
            siteName: seoMeta.openGraph.siteName,
            type: "website",
        },
    };
}

/**
 * Generate title for a money page
 */
export function generateMoneyPageTitle(params: {
    productClusterName: string;
    originCountryName: string;
    destCountryName: string;
}): string {
    return `Import Duty & Landed Cost: ${params.productClusterName} from ${params.originCountryName} to ${params.destCountryName}`;
}

/**
 * Generate description for a money page
 */
export function generateMoneyPageDescription(params: {
    productClusterName: string;
    originCountryName: string;
    destCountryName: string;
}): string {
    return `Calculate import duties, VAT, and landed cost for ${params.productClusterName} from ${params.originCountryName} to ${params.destCountryName}. Instant estimates with document checklist and compliance guidance.`;
}
