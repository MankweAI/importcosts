/**
 * Sitemap Unit Tests
 * 
 * Tests for sitemap generation and filtering.
 */

import { IndexStatus, PageType } from "@prisma/client";
import {
    filterIndexablePages,
    generateSitemapUrls,
    partitionSitemaps,
    groupPagesByType,
    generateSitemapXml,
    type SitemapPage,
} from "@/lib/seo/sitemapWriter";

describe("Sitemap Writer", () => {
    const createTestPage = (
        slug: string,
        indexStatus: IndexStatus,
        pageType: PageType = PageType.CLUSTER_ORIGIN_DEST
    ): SitemapPage => ({
        slug,
        indexStatus,
        pageType,
        lastBuiltAt: new Date("2026-02-01"),
    });

    describe("filterIndexablePages", () => {
        it("includes only INDEX pages", () => {
            const pages: SitemapPage[] = [
                createTestPage("/page-1", IndexStatus.INDEX),
                createTestPage("/page-2", IndexStatus.NOINDEX),
                createTestPage("/page-3", IndexStatus.INDEX),
                createTestPage("/page-4", IndexStatus.BLOCKED_MISSING_DATA),
                createTestPage("/page-5", IndexStatus.CANONICAL_TO_OTHER),
            ];

            const result = filterIndexablePages(pages);

            expect(result).toHaveLength(2);
            expect(result.map((p) => p.slug)).toEqual(["/page-1", "/page-3"]);
        });

        it("returns empty array when no pages are indexable", () => {
            const pages: SitemapPage[] = [
                createTestPage("/page-1", IndexStatus.NOINDEX),
                createTestPage("/page-2", IndexStatus.BLOCKED_MISSING_DATA),
            ];

            const result = filterIndexablePages(pages);

            expect(result).toHaveLength(0);
        });

        it("returns all pages when all are indexable", () => {
            const pages: SitemapPage[] = [
                createTestPage("/page-1", IndexStatus.INDEX),
                createTestPage("/page-2", IndexStatus.INDEX),
            ];

            const result = filterIndexablePages(pages);

            expect(result).toHaveLength(2);
        });
    });

    describe("generateSitemapUrls", () => {
        it("generates URLs only for indexable pages", () => {
            const pages: SitemapPage[] = [
                createTestPage("/indexed", IndexStatus.INDEX),
                createTestPage("/not-indexed", IndexStatus.NOINDEX),
            ];

            const urls = generateSitemapUrls(pages);

            expect(urls).toHaveLength(1);
            expect(urls[0].loc).toContain("/indexed");
        });

        it("includes lastmod from lastBuiltAt", () => {
            const pages: SitemapPage[] = [
                {
                    slug: "/test",
                    indexStatus: IndexStatus.INDEX,
                    pageType: PageType.CLUSTER_ORIGIN_DEST,
                    lastBuiltAt: new Date("2026-02-15"),
                },
            ];

            const urls = generateSitemapUrls(pages);

            expect(urls[0].lastmod).toBe("2026-02-15");
        });

        it("omits lastmod when lastBuiltAt is null", () => {
            const pages: SitemapPage[] = [
                {
                    slug: "/test",
                    indexStatus: IndexStatus.INDEX,
                    pageType: PageType.CLUSTER_ORIGIN_DEST,
                    lastBuiltAt: null,
                },
            ];

            const urls = generateSitemapUrls(pages);

            expect(urls[0].lastmod).toBeUndefined();
        });

        it("sets correct priority based on page type", () => {
            const pages: SitemapPage[] = [
                createTestPage("/cluster", IndexStatus.INDEX, PageType.CLUSTER_ORIGIN_DEST),
                createTestPage("/hs", IndexStatus.INDEX, PageType.HS_ORIGIN_DEST),
                createTestPage("/hub", IndexStatus.INDEX, PageType.HS_HUB),
                createTestPage("/dir", IndexStatus.INDEX, PageType.DIRECTORY),
            ];

            const urls = generateSitemapUrls(pages);

            expect(urls[0].priority).toBe(0.8); // CLUSTER_ORIGIN_DEST
            expect(urls[1].priority).toBe(0.7); // HS_ORIGIN_DEST
            expect(urls[2].priority).toBe(0.6); // HS_HUB
            expect(urls[3].priority).toBe(0.5); // DIRECTORY
        });
    });

    describe("partitionSitemaps", () => {
        it("returns single partition for small page count", () => {
            const pages: SitemapPage[] = [
                createTestPage("/page-1", IndexStatus.INDEX),
                createTestPage("/page-2", IndexStatus.INDEX),
            ];

            const partitions = partitionSitemaps(pages);

            expect(partitions).toHaveLength(1);
            expect(partitions[0]).toHaveLength(2);
        });

        it("returns empty partition for no indexable pages", () => {
            const pages: SitemapPage[] = [
                createTestPage("/page-1", IndexStatus.NOINDEX),
            ];

            const partitions = partitionSitemaps(pages);

            expect(partitions).toHaveLength(1);
            expect(partitions[0]).toHaveLength(0);
        });

        it("filters out non-indexable pages before partitioning", () => {
            const pages: SitemapPage[] = [
                createTestPage("/indexed", IndexStatus.INDEX),
                createTestPage("/not-indexed", IndexStatus.NOINDEX),
                createTestPage("/blocked", IndexStatus.BLOCKED_MISSING_DATA),
            ];

            const partitions = partitionSitemaps(pages);

            expect(partitions[0]).toHaveLength(1);
            expect(partitions[0][0].slug).toBe("/indexed");
        });
    });

    describe("groupPagesByType", () => {
        it("groups pages by their page type", () => {
            const pages: SitemapPage[] = [
                createTestPage("/cluster-1", IndexStatus.INDEX, PageType.CLUSTER_ORIGIN_DEST),
                createTestPage("/cluster-2", IndexStatus.INDEX, PageType.CLUSTER_ORIGIN_DEST),
                createTestPage("/hs-1", IndexStatus.INDEX, PageType.HS_ORIGIN_DEST),
                createTestPage("/hub-1", IndexStatus.INDEX, PageType.HS_HUB),
            ];

            const groups = groupPagesByType(pages);

            expect(groups[PageType.CLUSTER_ORIGIN_DEST]).toHaveLength(2);
            expect(groups[PageType.HS_ORIGIN_DEST]).toHaveLength(1);
            expect(groups[PageType.HS_HUB]).toHaveLength(1);
            expect(groups[PageType.DIRECTORY]).toHaveLength(0);
        });

        it("only includes indexable pages in groups", () => {
            const pages: SitemapPage[] = [
                createTestPage("/indexed", IndexStatus.INDEX, PageType.CLUSTER_ORIGIN_DEST),
                createTestPage("/not-indexed", IndexStatus.NOINDEX, PageType.CLUSTER_ORIGIN_DEST),
            ];

            const groups = groupPagesByType(pages);

            expect(groups[PageType.CLUSTER_ORIGIN_DEST]).toHaveLength(1);
        });
    });

    describe("generateSitemapXml", () => {
        it("generates valid XML structure", () => {
            const urls = [
                {
                    loc: "https://www.importcosts.co.za/test",
                    lastmod: "2026-02-01",
                    changefreq: "weekly" as const,
                    priority: 0.8,
                },
            ];

            const xml = generateSitemapXml(urls);

            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain("<urlset");
            expect(xml).toContain("<url>");
            expect(xml).toContain("<loc>https://www.importcosts.co.za/test</loc>");
            expect(xml).toContain("<lastmod>2026-02-01</lastmod>");
            expect(xml).toContain("<changefreq>weekly</changefreq>");
            expect(xml).toContain("<priority>0.8</priority>");
            expect(xml).toContain("</url>");
            expect(xml).toContain("</urlset>");
        });

        it("escapes XML special characters in URLs", () => {
            const urls = [
                {
                    loc: "https://www.importcosts.co.za/test?param=1&other=2",
                },
            ];

            const xml = generateSitemapXml(urls);

            expect(xml).toContain("&amp;");
            expect(xml).not.toContain("?param=1&other");
        });

        it("handles empty URL list", () => {
            const xml = generateSitemapXml([]);

            expect(xml).toContain("<urlset");
            expect(xml).toContain("</urlset>");
            expect(xml).not.toContain("<url>");
        });
    });
});
