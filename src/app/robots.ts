/**
 * robots.ts
 * 
 * Dynamic robots.txt generation with sitemap references.
 */

import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/dashboard/",
                    "/admin/",
                    "/_next/",
                    "/sign-in",
                    "/sign-up",
                    "/verify",
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
