/**
 * Sitemap Writer
 * 
 * Generates sitemaps for SEO pages, filtering to only INDEX pages.
 * Supports partitioning for large page volumes (max 10k URLs per file).
 */

import { IndexStatus, PageType } from "@prisma/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za";
const MAX_URLS_PER_SITEMAP = 10000;

export type SitemapPage = {
    slug: string;
    indexStatus: IndexStatus;
    pageType: PageType;
    lastBuiltAt: Date | null;
};

export type SitemapUrl = {
    loc: string;
    lastmod?: string;
    changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
};

export type SitemapIndex = {
    sitemaps: {
        loc: string;
        lastmod?: string;
    }[];
};

/**
 * Filter pages to only include those that should be indexed
 */
export function filterIndexablePages(pages: SitemapPage[]): SitemapPage[] {
    return pages.filter((page) => page.indexStatus === IndexStatus.INDEX);
}

/**
 * Generate sitemap URLs from indexable pages
 */
export function generateSitemapUrls(pages: SitemapPage[]): SitemapUrl[] {
    const indexablePages = filterIndexablePages(pages);

    return indexablePages.map((page) => {
        const url: SitemapUrl = {
            loc: `${BASE_URL}${page.slug}`,
            changefreq: getChangeFrequency(page.pageType),
            priority: getPriority(page.pageType),
        };

        if (page.lastBuiltAt) {
            url.lastmod = page.lastBuiltAt.toISOString().split("T")[0];
        }

        return url;
    });
}

/**
 * Partition pages into multiple sitemaps if needed
 */
export function partitionSitemaps(pages: SitemapPage[]): SitemapPage[][] {
    const indexablePages = filterIndexablePages(pages);
    const partitions: SitemapPage[][] = [];

    for (let i = 0; i < indexablePages.length; i += MAX_URLS_PER_SITEMAP) {
        partitions.push(indexablePages.slice(i, i + MAX_URLS_PER_SITEMAP));
    }

    return partitions.length > 0 ? partitions : [[]];
}

/**
 * Group pages by type for separate sitemaps
 */
export function groupPagesByType(pages: SitemapPage[]): Record<PageType, SitemapPage[]> {
    const groups: Record<PageType, SitemapPage[]> = {
        [PageType.CLUSTER_ORIGIN_DEST]: [],
        [PageType.HS_ORIGIN_DEST]: [],
        [PageType.HS_HUB]: [],
        [PageType.DIRECTORY]: [],
    };

    const indexablePages = filterIndexablePages(pages);

    for (const page of indexablePages) {
        groups[page.pageType].push(page);
    }

    return groups;
}

/**
 * Generate sitemap XML content
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
    const urlEntries = urls
        .map((url) => {
            let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;

            if (url.lastmod) {
                entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
            }
            if (url.changefreq) {
                entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
            }
            if (url.priority !== undefined) {
                entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
            }

            entry += `\n  </url>`;
            return entry;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index XML content
 */
export function generateSitemapIndexXml(sitemaps: { loc: string; lastmod?: string }[]): string {
    const sitemapEntries = sitemaps
        .map((sitemap) => {
            let entry = `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>`;
            if (sitemap.lastmod) {
                entry += `\n    <lastmod>${sitemap.lastmod}</lastmod>`;
            }
            entry += `\n  </sitemap>`;
            return entry;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Get change frequency based on page type
 */
function getChangeFrequency(pageType: PageType): SitemapUrl["changefreq"] {
    switch (pageType) {
        case PageType.CLUSTER_ORIGIN_DEST:
        case PageType.HS_ORIGIN_DEST:
            return "weekly";
        case PageType.HS_HUB:
            return "monthly";
        case PageType.DIRECTORY:
            return "monthly";
        default:
            return "weekly";
    }
}

/**
 * Get priority based on page type
 */
function getPriority(pageType: PageType): number {
    switch (pageType) {
        case PageType.CLUSTER_ORIGIN_DEST:
            return 0.8;
        case PageType.HS_ORIGIN_DEST:
            return 0.7;
        case PageType.HS_HUB:
            return 0.6;
        case PageType.DIRECTORY:
            return 0.5;
        default:
            return 0.5;
    }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
