/**
 * sitemap.ts
 * 
 * Dynamic sitemap generation - only includes pages with indexStatus=INDEX.
 * For now returns static pages; will be extended to query database for SEO pages.
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
            url: `${BASE_URL}/calculator`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Dynamic SEO pages will be added in Phase 5
    // For now, we return only static pages
    // 
    // Future implementation:
    // const indexablePages = await prisma.seoPage.findMany({
    //   where: { indexStatus: "INDEX" },
    //   select: { slug: true, lastBuiltAt: true, pageType: true },
    // });
    // 
    // const seoPages = indexablePages.map((page) => ({
    //   url: `${BASE_URL}${page.slug}`,
    //   lastModified: page.lastBuiltAt?.toISOString() || now,
    //   changeFrequency: "weekly" as const,
    //   priority: 0.8,
    // }));

    return [...staticPages];
}
