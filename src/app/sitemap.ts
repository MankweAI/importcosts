/**
 * sitemap.ts
 *
 * Dynamic sitemap generation — includes static pages and all
 * indexable pSEO pages from the database.
 */

import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date().toISOString();

    // Static marketing pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/how-it-works`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/calculate`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Dynamic pSEO pages from the database
    let seoPages: MetadataRoute.Sitemap = [];
    try {
        const { getIndexablePages } = await import("@/lib/db/services/seoPage.service");
        const indexablePages = await getIndexablePages();

        seoPages = indexablePages.map((page) => ({
            url: `${BASE_URL}${page.slug}`,
            lastModified: page.lastBuiltAt?.toISOString() || now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error("[Sitemap] Failed to fetch pSEO pages:", error);
    }

    return [...staticPages, ...seoPages];
}
