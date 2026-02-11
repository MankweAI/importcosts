/**
 * riskBulletData.ts
 *
 * Generates contextual risk bullet statements for pSEO pages.
 * Template-aware: cluster pages get product-level risks,
 * HS pages get classification risks.
 */

import type { RouteContext } from "@/types/pseo";

export interface RiskBullet {
    icon: "classification" | "freight" | "currency" | "compliance" | "dumping" | "fta";
    title: string;
    detail: string;
}

const COUNTRY_NAMES: Record<string, string> = {
    CN: "China", US: "United States", DE: "Germany", JP: "Japan",
    IN: "India", KR: "South Korea", IT: "Italy", TW: "Taiwan",
    GB: "United Kingdom", FR: "France", TR: "Turkey", TH: "Thailand",
    BR: "Brazil", MX: "Mexico",
};

const FTA_COUNTRIES = new Set(["MZ", "BW", "NA", "ZW", "TZ", "KE", "LS", "SZ"]);
const EU_COUNTRIES = new Set(["DE", "FR", "IT", "GB", "NL", "BE", "ES", "PT", "AT", "PL", "SE", "DK", "FI", "IE", "CZ", "HU", "RO", "BG", "HR", "SK", "SI", "LT", "LV", "EE", "CY", "MT", "LU", "GR"]);

function cn(iso: string): string {
    return COUNTRY_NAMES[iso] || iso;
}

/**
 * Generate risk bullets for a Product Decision Page.
 */
export function generateProductRiskBullets(
    productName: string,
    originIso: string,
    dutyPct?: number | null,
): RiskBullet[] {
    const bullets: RiskBullet[] = [];
    const origin = cn(originIso);

    // 1. Classification risk (always relevant)
    bullets.push({
        icon: "classification",
        title: "HS classification uncertainty",
        detail: `"${productName}" can map to multiple HS codes — a wrong choice could add up to ${dutyPct ? dutyPct + 10 : 20}% in unexpected duty.`,
    });

    // 2. Freight volatility
    bullets.push({
        icon: "freight",
        title: "Freight volatility",
        detail: `A 15% rise in shipping costs from ${origin} pushes your margin under breakeven. Lock in rates early or use CIF terms.`,
    });

    // 3. FTA / preferential access
    if (FTA_COUNTRIES.has(originIso)) {
        bullets.push({
            icon: "fta",
            title: "Preferential rate available",
            detail: `${origin} is SADC-eligible — you may qualify for reduced or zero duty. Ensure you have a valid Certificate of Origin.`,
        });
    } else if (EU_COUNTRIES.has(originIso)) {
        bullets.push({
            icon: "fta",
            title: "SADC-EU EPA may apply",
            detail: `The SADC-EU Economic Partnership Agreement could reduce your duty from ${dutyPct || "standard"}% — verify product coverage with your broker.`,
        });
    } else {
        bullets.push({
            icon: "fta",
            title: "No preferential trade agreement",
            detail: `There is currently no FTA between South Africa and ${origin}. Full MFN duty of ${dutyPct || "up to 45"}% applies.`,
        });
    }

    // 4. Currency risk
    bullets.push({
        icon: "currency",
        title: "ZAR/USD exchange exposure",
        detail: `A 5% rand weakening adds ~R${Math.round((dutyPct || 15) * 50)} per R10,000 unit to your landed cost. Consider forward cover.`,
    });

    // 5. Compliance
    bullets.push({
        icon: "compliance",
        title: "NRCS / SABS compliance",
        detail: `Certain ${productName} may require NRCS Letters of Authority (LoA) before clearance. Check VC 8055 / VC 8043 applicability.`,
    });

    return bullets;
}

/**
 * Generate risk bullets for an HS-Code Decision Page.
 */
export function generateHsRiskBullets(
    hs6: string,
    originIso: string,
    dutyPct?: number | null,
): RiskBullet[] {
    const bullets: RiskBullet[] = [];
    const origin = cn(originIso);
    const heading4 = hs6.substring(0, 4);

    // 1. Classification risk
    bullets.push({
        icon: "classification",
        title: "Adjacent HS codes carry different rates",
        detail: `HS ${hs6} has ${dutyPct || "a specific"}% duty. Neighboring codes in heading ${heading4} may be 0% or 45%. Verify your exact subheading.`,
    });

    // 2. Anti-dumping
    bullets.push({
        icon: "dumping",
        title: "Anti-dumping investigation risk",
        detail: `Products under heading ${heading4} from ${origin} have been subject to ITAC investigations. A new AD duty could add 15-60% surcharge.`,
    });

    // 3. VAT uplift
    bullets.push({
        icon: "compliance",
        title: "VAT calculated on inflated base",
        detail: `15% VAT applies on (customs value + duty + 10% uplift). Don't forget the +10% uplift factor when estimating total cost.`,
    });

    // 4. Freight
    bullets.push({
        icon: "freight",
        title: "Freight cost sensitivity",
        detail: `For HS ${hs6}, freight can represent 5-25% of landed cost depending on weight/volume ratio. Get multiple quotes.`,
    });

    // 5. FTA
    if (!FTA_COUNTRIES.has(originIso) && !EU_COUNTRIES.has(originIso)) {
        bullets.push({
            icon: "fta",
            title: "No duty relief from origin",
            detail: `${origin} has no preferential trade agreement with SA for this heading. Full MFN rate applies.`,
        });
    }

    return bullets;
}

/**
 * Generic risk bullets for port/route pages.
 */
export function generatePortRiskBullets(
    originPort: string,
    destPort: string,
): RiskBullet[] {
    return [
        {
            icon: "freight",
            title: "Port congestion risk",
            detail: `${destPort} experiences periodic congestion. Import demurrage can rise 15% if delays exceed 3 working days.`,
        },
        {
            icon: "freight",
            title: "Transshipment delays",
            detail: `If cargo from ${originPort} changes vessels en route, lead time can unpredictably grow by 7-14 days.`,
        },
        {
            icon: "currency",
            title: "USD-denominated freight invoices",
            detail: `Freight from ${originPort} is typically invoiced in USD. A weaker rand adds cost per kilogram.`,
        },
        {
            icon: "compliance",
            title: "X-ray and inspection",
            detail: `SARS may select containers at ${destPort} for X-ray scanning, adding 1-3 days and R2,000-R5,000 in fees.`,
        },
    ];
}
