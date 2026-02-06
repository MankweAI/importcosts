/**
 * SEO Index Policy
 * 
 * Determines whether a page should be indexed based on readiness criteria.
 * A page is INDEXABLE only if it satisfies all requirements from the blueprint.
 */

import { IndexStatus, PageType } from "@prisma/client";

export type PageIndexData = {
  indexStatus: IndexStatus;
  readinessScore: number;
  hasHsCandidates: boolean;
  hasTariffRates: boolean;
  hasDocChecklist: boolean;
  hasRiskFlags: boolean;
  internalLinksCount: number;
  hasComputedScenarios: boolean;
  canonicalSlug: string | null;
};

export type IndexDecision = {
  shouldIndex: boolean;
  robotsDirective: string;
  blockerReasons: string[];
};

const READINESS_THRESHOLD = 70;
const MIN_INTERNAL_LINKS = 6;

/**
 * Evaluate whether a page meets all indexation criteria
 */
export function evaluateIndexCriteria(page: PageIndexData): IndexDecision {
  const blockerReasons: string[] = [];

  // Check explicit index status overrides
  if (page.indexStatus === IndexStatus.NOINDEX) {
    return {
      shouldIndex: false,
      robotsDirective: "noindex, nofollow",
      blockerReasons: ["Page explicitly set to NOINDEX"],
    };
  }

  if (page.indexStatus === IndexStatus.CANONICAL_TO_OTHER) {
    return {
      shouldIndex: false,
      robotsDirective: "noindex, follow",
      blockerReasons: ["Page canonicalizes to another page"],
    };
  }

  if (page.indexStatus === IndexStatus.BLOCKED_MISSING_DATA) {
    blockerReasons.push("Missing required data");
  }

  // Check readiness score threshold
  if (page.readinessScore < READINESS_THRESHOLD) {
    blockerReasons.push(`Readiness score (${page.readinessScore}) below threshold (${READINESS_THRESHOLD})`);
  }

  // Check HS candidates exist
  if (!page.hasHsCandidates) {
    blockerReasons.push("No HS code candidates available");
  }

  // Check tariff rates exist
  if (!page.hasTariffRates) {
    blockerReasons.push("Missing tariff rates for HS candidates");
  }

  // Check computed scenarios exist
  if (!page.hasComputedScenarios) {
    blockerReasons.push("No computed scenario outputs available");
  }

  // Check minimum internal links
  if (page.internalLinksCount < MIN_INTERNAL_LINKS) {
    blockerReasons.push(`Internal links (${page.internalLinksCount}) below minimum (${MIN_INTERNAL_LINKS})`);
  }

  // Determine final decision
  const shouldIndex = blockerReasons.length === 0;

  return {
    shouldIndex,
    robotsDirective: shouldIndex ? "index, follow" : "noindex, nofollow",
    blockerReasons,
  };
}

/**
 * Get the robots meta directive for a page
 */
export function getRobotsDirective(indexStatus: IndexStatus): string {
  switch (indexStatus) {
    case IndexStatus.INDEX:
      return "index, follow";
    case IndexStatus.NOINDEX:
      return "noindex, nofollow";
    case IndexStatus.CANONICAL_TO_OTHER:
      return "noindex, follow";
    case IndexStatus.BLOCKED_MISSING_DATA:
      return "noindex, nofollow";
    default:
      return "noindex, nofollow";
  }
}

/**
 * Calculate readiness score based on available data
 */
export function calculateReadinessScore(data: {
  hasHsCandidates: boolean;
  hasTariffRates: boolean;
  hasVatModule: boolean;
  hasDocChecklist: boolean;
  hasRiskFlags: boolean;
  internalLinksCount: number;
}): number {
  let score = 0;

  // +30 if HS candidates exist for cluster
  if (data.hasHsCandidates) score += 30;

  // +25 if at least one HS candidate has tariff rate
  if (data.hasTariffRates) score += 25;

  // +15 if VAT rule module can compute output
  if (data.hasVatModule) score += 15;

  // +10 if docs checklist non-empty
  if (data.hasDocChecklist) score += 10;

  // +10 if risk flags non-empty OR explicitly "none known"
  if (data.hasRiskFlags) score += 10;

  // +10 if internal links count >= 6
  if (data.internalLinksCount >= MIN_INTERNAL_LINKS) score += 10;

  return score;
}
