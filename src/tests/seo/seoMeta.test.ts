/**
 * SEO Meta Builder Unit Tests
 * 
 * Tests for indexation logic and SEO metadata generation.
 */

import { IndexStatus, PageType } from "@prisma/client";
import {
    evaluateIndexCriteria,
    getRobotsDirective,
    calculateReadinessScore,
    type PageIndexData,
} from "@/lib/seo/indexPolicy";
import { buildSeoMeta, type SeoPageInput } from "@/lib/seo/seoMeta";

describe("SEO Index Policy", () => {
    describe("evaluateIndexCriteria", () => {
        it("returns INDEX for page meeting all criteria", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.INDEX,
                readinessScore: 85,
                hasHsCandidates: true,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 8,
                hasComputedScenarios: true,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(true);
            expect(result.robotsDirective).toBe("index, follow");
            expect(result.blockerReasons).toHaveLength(0);
        });

        it("returns NOINDEX for page with explicit NOINDEX status", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.NOINDEX,
                readinessScore: 100,
                hasHsCandidates: true,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 10,
                hasComputedScenarios: true,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.robotsDirective).toBe("noindex, nofollow");
            expect(result.blockerReasons).toContain("Page explicitly set to NOINDEX");
        });

        it("returns NOINDEX for page with BLOCKED_MISSING_DATA status", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.BLOCKED_MISSING_DATA,
                readinessScore: 50,
                hasHsCandidates: false,
                hasTariffRates: false,
                hasDocChecklist: false,
                hasRiskFlags: false,
                internalLinksCount: 2,
                hasComputedScenarios: false,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.robotsDirective).toBe("noindex, nofollow");
        });

        it("returns NOINDEX for page with low readiness score", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.INDEX,
                readinessScore: 60, // Below 70 threshold
                hasHsCandidates: true,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 8,
                hasComputedScenarios: true,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.blockerReasons).toContainEqual(
                expect.stringContaining("Readiness score")
            );
        });

        it("returns NOINDEX for page without HS candidates", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.INDEX,
                readinessScore: 80,
                hasHsCandidates: false,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 8,
                hasComputedScenarios: true,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.blockerReasons).toContain("No HS code candidates available");
        });

        it("returns NOINDEX for page without computed scenarios", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.INDEX,
                readinessScore: 80,
                hasHsCandidates: true,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 8,
                hasComputedScenarios: false,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.blockerReasons).toContain(
                "No computed scenario outputs available"
            );
        });

        it("returns NOINDEX for page with insufficient internal links", () => {
            const page: PageIndexData = {
                indexStatus: IndexStatus.INDEX,
                readinessScore: 80,
                hasHsCandidates: true,
                hasTariffRates: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 4, // Below 6 minimum
                hasComputedScenarios: true,
                canonicalSlug: null,
            };

            const result = evaluateIndexCriteria(page);

            expect(result.shouldIndex).toBe(false);
            expect(result.blockerReasons).toContainEqual(
                expect.stringContaining("Internal links")
            );
        });
    });

    describe("getRobotsDirective", () => {
        it('returns "index, follow" for INDEX status', () => {
            expect(getRobotsDirective(IndexStatus.INDEX)).toBe("index, follow");
        });

        it('returns "noindex, nofollow" for NOINDEX status', () => {
            expect(getRobotsDirective(IndexStatus.NOINDEX)).toBe("noindex, nofollow");
        });

        it('returns "noindex, follow" for CANONICAL_TO_OTHER status', () => {
            expect(getRobotsDirective(IndexStatus.CANONICAL_TO_OTHER)).toBe(
                "noindex, follow"
            );
        });

        it('returns "noindex, nofollow" for BLOCKED_MISSING_DATA status', () => {
            expect(getRobotsDirective(IndexStatus.BLOCKED_MISSING_DATA)).toBe(
                "noindex, nofollow"
            );
        });
    });

    describe("calculateReadinessScore", () => {
        it("returns 100 for page with all components", () => {
            const score = calculateReadinessScore({
                hasHsCandidates: true,
                hasTariffRates: true,
                hasVatModule: true,
                hasDocChecklist: true,
                hasRiskFlags: true,
                internalLinksCount: 10,
            });

            expect(score).toBe(100);
        });

        it("returns 0 for page with no components", () => {
            const score = calculateReadinessScore({
                hasHsCandidates: false,
                hasTariffRates: false,
                hasVatModule: false,
                hasDocChecklist: false,
                hasRiskFlags: false,
                internalLinksCount: 0,
            });

            expect(score).toBe(0);
        });

        it("returns correct partial scores", () => {
            // Only HS candidates (30 points)
            expect(
                calculateReadinessScore({
                    hasHsCandidates: true,
                    hasTariffRates: false,
                    hasVatModule: false,
                    hasDocChecklist: false,
                    hasRiskFlags: false,
                    internalLinksCount: 0,
                })
            ).toBe(30);

            // HS + tariff (30 + 25 = 55)
            expect(
                calculateReadinessScore({
                    hasHsCandidates: true,
                    hasTariffRates: true,
                    hasVatModule: false,
                    hasDocChecklist: false,
                    hasRiskFlags: false,
                    internalLinksCount: 0,
                })
            ).toBe(55);
        });

        it("counts internal links correctly", () => {
            // 5 links (below threshold, no points)
            expect(
                calculateReadinessScore({
                    hasHsCandidates: false,
                    hasTariffRates: false,
                    hasVatModule: false,
                    hasDocChecklist: false,
                    hasRiskFlags: false,
                    internalLinksCount: 5,
                })
            ).toBe(0);

            // 6 links (meets threshold, 10 points)
            expect(
                calculateReadinessScore({
                    hasHsCandidates: false,
                    hasTariffRates: false,
                    hasVatModule: false,
                    hasDocChecklist: false,
                    hasRiskFlags: false,
                    internalLinksCount: 6,
                })
            ).toBe(10);
        });
    });
});

describe("SEO Meta Builder", () => {
    const createTestPage = (overrides: Partial<SeoPageInput> = {}): SeoPageInput => ({
        slug: "/import-duty-vat-landed-cost/solar-panels/from/china/to/south-africa",
        pageType: PageType.CLUSTER_ORIGIN_DEST,
        indexStatus: IndexStatus.INDEX,
        canonicalSlug: null,
        readinessScore: 85,
        title: "Import Duty & Landed Cost: Solar Panels from China to South Africa",
        description: "Calculate import duties for solar panels from China to SA.",
        productClusterName: "Solar Panels",
        originCountryName: "China",
        destCountryName: "South Africa",
        hasHsCandidates: true,
        hasTariffRates: true,
        hasDocChecklist: true,
        hasRiskFlags: true,
        internalLinksCount: 8,
        hasComputedScenarios: true,
        ...overrides,
    });

    describe("buildSeoMeta", () => {
        it("builds complete metadata for indexable page", () => {
            const page = createTestPage();
            const meta = buildSeoMeta(page);

            expect(meta.title).toBe(page.title);
            expect(meta.description).toBe(page.description);
            expect(meta.shouldIndex).toBe(true);
            expect(meta.robotsDirective).toBe("index, follow");
            expect(meta.canonicalUrl).toContain(page.slug);
        });

        it("uses canonical slug when set", () => {
            const page = createTestPage({
                canonicalSlug: "/import-duty-vat-landed-cost/solar-panels/from/cn/to/za",
            });
            const meta = buildSeoMeta(page);

            expect(meta.canonicalUrl).toContain("cn/to/za");
        });

        it("sets NOINDEX for page with low readiness", () => {
            const page = createTestPage({ readinessScore: 50 });
            const meta = buildSeoMeta(page);

            expect(meta.shouldIndex).toBe(false);
            expect(meta.robotsDirective).toBe("noindex, nofollow");
            expect(meta.blockerReasons.length).toBeGreaterThan(0);
        });

        it("includes OpenGraph metadata", () => {
            const page = createTestPage();
            const meta = buildSeoMeta(page);

            expect(meta.openGraph.title).toBe(page.title);
            expect(meta.openGraph.description).toBe(page.description);
            expect(meta.openGraph.siteName).toBe("ImportCosts");
            expect(meta.openGraph.type).toBe("website");
        });
    });
});
