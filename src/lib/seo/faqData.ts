/**
 * faqData.ts
 *
 * Programmatic FAQ generator for pSEO pages.
 * Each page gets a unique set of 6-8 questions derived from route context
 * and SSR calculation results.
 */

import type { RouteContext, CalculationResult } from "@/types/pseo";

export interface FAQItem {
    question: string;
    answer: string;
}

/**
 * Humanize an ISO country code to a readable name.
 * Falls back to the ISO code itself if no mapping found.
 */
const COUNTRY_NAMES: Record<string, string> = {
    CN: "China", US: "United States", DE: "Germany", JP: "Japan",
    KR: "South Korea", IN: "India", GB: "United Kingdom", IT: "Italy",
    FR: "France", TW: "Taiwan", TH: "Thailand", VN: "Vietnam",
    MY: "Malaysia", ID: "Indonesia", BR: "Brazil", MX: "Mexico",
    TR: "Turkey", PL: "Poland", NL: "Netherlands", ES: "Spain",
    AU: "Australia", CA: "Canada", SE: "Sweden", CH: "Switzerland",
    AT: "Austria", BE: "Belgium", CZ: "Czech Republic", DK: "Denmark",
    FI: "Finland", HU: "Hungary", IE: "Ireland", NO: "Norway",
    PT: "Portugal", RO: "Romania", SK: "Slovakia", ZA: "South Africa",
    AE: "United Arab Emirates", SA: "Saudi Arabia", EG: "Egypt",
    NG: "Nigeria", KE: "Kenya", GH: "Ghana", TZ: "Tanzania",
    MZ: "Mozambique", BW: "Botswana", NA: "Namibia", ZW: "Zimbabwe",
    SG: "Singapore", HK: "Hong Kong", PH: "Philippines",
};

export function getCountryName(iso: string): string {
    return COUNTRY_NAMES[iso.toUpperCase()] || iso.toUpperCase();
}

function formatZAR(amount: number): string {
    return `R ${amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function slugToName(slug: string): string {
    return slug.replace(/-/g, " ");
}

/* ─── Cluster Page FAQs ─── */
function buildClusterFAQs(
    productName: string,
    originName: string,
    originIso: string,
    result?: CalculationResult | null,
): FAQItem[] {
    const items: FAQItem[] = [];

    // Q1: Duty rate question
    if (result) {
        const dutyLine = result.line_items.find(li => li.key === "duty");
        const dutyRate = dutyLine?.audit?.rates?.rate;
        const dutyAmount = dutyLine?.amount_zar;

        items.push({
            question: `What is the import duty rate for ${productName} from ${originName} to South Africa?`,
            answer: dutyRate != null
                ? `The current import duty rate for ${productName} imported from ${originName} into South Africa is ${typeof dutyRate === "number" ? `${dutyRate}% ad valorem` : dutyRate}. On a R10,000 invoice value, this translates to approximately ${formatZAR(dutyAmount || 0)} in customs duty, based on the latest SARS tariff schedule.`
                : `Import duty rates for ${productName} from ${originName} depend on the specific HS code classification. Use our calculator above to get an instant estimate based on the latest SARS tariff book.`,
        });
    } else {
        items.push({
            question: `What is the import duty rate for ${productName} from ${originName} to South Africa?`,
            answer: `Import duty rates for ${productName} from ${originName} vary based on the specific HS code classification and any applicable trade agreements. Use our free calculator above to get an instant, accurate estimate.`,
        });
    }

    // Q2: Landed cost
    items.push({
        question: `What is the total landed cost of importing ${productName} from ${originName}?`,
        answer: result
            ? `The estimated total landed cost for importing ${productName} from ${originName} to South Africa on a R10,000 invoice value is approximately ${formatZAR(result.summary.total_landed_cost_zar)}. This includes customs duty, VAT at 15%, and estimated freight and insurance charges.`
            : `The total landed cost includes the invoice value, freight, insurance, customs duties, and 15% VAT. Use our calculator to get an accurate estimate based on your specific shipment value.`,
    });

    // Q3: VAT
    items.push({
        question: `How is VAT calculated on ${productName} imported into South Africa?`,
        answer: `South African VAT on imports is charged at 15% on the customs value, which consists of the invoice value plus freight, insurance, and any customs duties payable. For VAT-registered businesses, this import VAT can be claimed back as an input credit in your next VAT return.`,
    });

    // Q4: Documents
    items.push({
        question: `What documents do I need to import ${productName} from ${originName}?`,
        answer: `To import ${productName} from ${originName} into South Africa, you typically need: a Commercial Invoice, Bill of Lading or Airway Bill, Packing List, and the SAD500 customs declaration form. Depending on the product, you may also need a Certificate of Origin (especially to claim preferential duty rates), NRCS approval letters, or import permits.`,
    });

    // Q5: Preferential rates
    const hasPref = result?.preference_decision?.status === "eligible";
    items.push({
        question: `Can I get reduced duty rates when importing from ${originName}?`,
        answer: hasPref
            ? `Yes! ${originName} may qualify for preferential duty rates under applicable trade agreements. ${result?.preference_decision?.best_option ? `The ${result.preference_decision.best_option.agreement_name} agreement could reduce your duty rate significantly.` : ""} You will need a valid Certificate of Origin and must meet Rules of Origin requirements. Use our calculator to see the exact savings.`
            : `Preferential duty rates from ${originName} depend on active trade agreements between ${originName} and South Africa (or the SACU region). South Africa participates in several trade agreements including SADC, EU-EPA, and AfCFTA. Use our calculator to check if you qualify for a reduced rate.`,
    });

    // Q6: HS Code
    items.push({
        question: `What HS code should I use for ${productName}?`,
        answer: `The correct Harmonized System (HS) code for ${productName} depends on the specific product characteristics such as material composition, function, and intended use. Incorrect classification can result in overpaying duties or customs penalties. Our calculator automatically maps ${productName} to the most likely HS code and shows you the duty implications.`,
    });

    // Q7: Timeline
    items.push({
        question: `How long does it take to clear ${productName} through South African customs?`,
        answer: `Customs clearance in South Africa typically takes 1-3 business days for straightforward shipments with correct documentation. However, goods requiring inspection, permit verification, or those flagged for review can take 5-10 business days. Having all documents prepared before arrival — especially your SAD500 and Commercial Invoice — significantly speeds up the process.`,
    });

    return items;
}

/* ─── HS Code Page FAQs ─── */
function buildHsFAQs(
    hs6: string,
    originName: string,
    originIso: string,
    result?: CalculationResult | null,
): FAQItem[] {
    const items: FAQItem[] = [];
    const chapter = hs6.substring(0, 2);

    // Q1: What goods
    items.push({
        question: `What goods are classified under HS code ${hs6}?`,
        answer: `HS code ${hs6} falls under Chapter ${chapter} of the Harmonized System. The 6-digit code specifies a particular product category used internationally for customs classification. South Africa may further subdivide this into 8-digit tariff headings with different duty rates. Use our calculator to see the exact classification details and applicable rates.`,
    });

    // Q2: Duty rate
    if (result) {
        const dutyLine = result.line_items.find(li => li.key === "duty");
        const dutyRate = dutyLine?.audit?.rates?.rate;

        items.push({
            question: `What is the duty rate for HS ${hs6} imports from ${originName}?`,
            answer: dutyRate != null
                ? `The current duty rate applied to HS code ${hs6} for goods imported from ${originName} to South Africa is ${typeof dutyRate === "number" ? `${dutyRate}% ad valorem` : dutyRate}, based on the ${result.tariff.version} tariff schedule.`
                : `The duty rate for HS code ${hs6} from ${originName} depends on the specific tariff line and any applicable trade agreements. Our calculator provides the exact rate using the latest SARS data.`,
        });
    } else {
        items.push({
            question: `What is the duty rate for HS ${hs6} imports from ${originName}?`,
            answer: `Duty rates for HS code ${hs6} from ${originName} vary based on the applicable tariff schedule and trade agreements. Enter your shipment details above for an instant calculation.`,
        });
    }

    // Q3: Landed cost
    items.push({
        question: `How do I calculate the landed cost for HS ${hs6} from ${originName}?`,
        answer: result
            ? `For a R10,000 shipment of goods classified under HS ${hs6} from ${originName}, the estimated landed cost is ${formatZAR(result.summary.total_landed_cost_zar)}. This includes the invoice value, estimated freight (R1,500), customs duty, and 15% South African VAT.`
            : `Landed cost = Invoice Value + Freight + Insurance + Customs Duty + VAT (15%). Use our calculator above to get an instant estimate with the current duty rate for HS ${hs6}.`,
    });

    // Q4: Preferential rates
    items.push({
        question: `Are there preferential rates available for HS ${hs6} from ${originName}?`,
        answer: result?.preference_decision?.status === "eligible"
            ? `Yes, preferential duty rates may apply to HS ${hs6} from ${originName} under the ${result.preference_decision.best_option?.agreement_name || "applicable trade"} agreement. A valid Certificate of Origin is typically required to claim the reduced rate.`
            : `Preferential rates for HS ${hs6} depend on active trade agreements. South Africa has preferential arrangements through SADC, EU-EPA, EFTA, and AfCFTA. Check our calculator for your specific origin and product combination.`,
    });

    // Q5: VAT
    items.push({
        question: `Is VAT charged on HS ${hs6} imports into South Africa?`,
        answer: `Yes, South African import VAT of 15% is charged on almost all imported goods, including those under HS ${hs6}. The VAT is calculated on the customs value (invoice + freight + insurance + duty). VAT-registered businesses can claim this as an input tax credit.`,
    });

    // Q6: Compliance
    items.push({
        question: `What compliance requirements apply to HS ${hs6}?`,
        answer: `Compliance requirements for HS ${hs6} may include NRCS (National Regulator for Compulsory Specifications) approval, SABS standards, import permits, or specific labelling requirements depending on the Chapter ${chapter} category. Our risk assessment tool flags potential compliance issues automatically when you run a calculation.`,
    });

    // Q7: Documentation
    items.push({
        question: `What documentation is needed to import HS ${hs6} goods from ${originName}?`,
        answer: `Standard documentation includes: Commercial Invoice, Bill of Lading/Airway Bill, Packing List, and the SAD500 customs declaration. For HS ${hs6} from ${originName}, you may additionally need a Certificate of Origin to claim preferential rates, plus any product-specific certificates or permits required by South African regulations.`,
    });

    return items;
}

/**
 * Generate page-specific FAQs based on route context and calculation results.
 */
export function generateFAQs(
    routeContext: RouteContext,
    result?: CalculationResult | null,
): FAQItem[] {
    const originName = getCountryName(routeContext.originIso);

    if (routeContext.pageType === "product_origin_money_page" && routeContext.clusterSlug) {
        const productName = slugToName(routeContext.clusterSlug);
        return buildClusterFAQs(productName, originName, routeContext.originIso, result);
    }

    if (routeContext.pageType === "hs_origin_money_page" && routeContext.hs6) {
        return buildHsFAQs(routeContext.hs6, originName, routeContext.originIso, result);
    }

    return [];
}
