/**
 * Canonical URL Management
 * 
 * Handles canonical URL generation and synonym deduplication.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.importcosts.co.za";

export type CanonicalInput = {
    slug: string;
    canonicalSlug: string | null;
    pageType: string;
};

/**
 * Get the canonical URL for a page
 * If canonicalSlug is set, use that; otherwise use the page's own slug
 */
export function getCanonicalUrl(page: CanonicalInput): string {
    const effectiveSlug = page.canonicalSlug || page.slug;

    // Ensure slug starts with /
    const normalizedSlug = effectiveSlug.startsWith("/")
        ? effectiveSlug
        : `/${effectiveSlug}`;

    return `${BASE_URL}${normalizedSlug}`;
}

/**
 * Check if a page points to a different canonical
 */
export function hasExternalCanonical(page: CanonicalInput): boolean {
    return page.canonicalSlug !== null && page.canonicalSlug !== page.slug;
}

/**
 * Build the SEO-friendly slug for a product/origin/dest page
 */
export function buildMoneyPageSlug(params: {
    clusterSlug: string;
    originIso2: string;
    destIso2: string;
}): string {
    // Convert ISO2 codes to URL-friendly names
    const originName = getCountrySlug(params.originIso2);
    const destName = getCountrySlug(params.destIso2);

    return `/import-duty-vat-landed-cost/${params.clusterSlug}/from/${originName}/to/${destName}`;
}

/**
 * Build the SEO-friendly slug for an HS code page
 */
export function buildHsPageSlug(params: {
    hs6: string;
    originIso2: string;
    destIso2: string;
}): string {
    const originName = getCountrySlug(params.originIso2);
    const destName = getCountrySlug(params.destIso2);

    return `/import-duty-vat-landed-cost/hs/${params.hs6}/from/${originName}/to/${destName}`;
}

/**
 * Convert ISO2 country code to URL-friendly slug
 */
function getCountrySlug(iso2: string): string {
    const countryMap: Record<string, string> = {
        ZA: "south-africa",
        CN: "china",
        US: "united-states",
        DE: "germany",
        AE: "uae",
        IN: "india",
        GB: "uk",
        JP: "japan",
        IT: "italy",
        TR: "turkey",
        VN: "vietnam",
    };

    return countryMap[iso2.toUpperCase()] || iso2.toLowerCase();
}

/**
 * Parse country slug back to ISO2 code
 */
export function parseCountrySlug(slug: string): string | null {
    const slugMap: Record<string, string> = {
        "south-africa": "ZA",
        "china": "CN",
        "united-states": "US",
        "germany": "DE",
        "uae": "AE",
        "india": "IN",
        "uk": "GB",
        "japan": "JP",
        "italy": "IT",
        "turkey": "TR",
        "vietnam": "VN",
    };

    return slugMap[slug.toLowerCase()] || null;
}
