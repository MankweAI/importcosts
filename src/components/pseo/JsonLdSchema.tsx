/**
 * JsonLdSchema.tsx
 *
 * Server component that outputs structured data (JSON-LD) for pSEO pages.
 * Renders Product, FAQPage, BreadcrumbList, and WebApplication schemas.
 */

import type { RouteContext, CalculationResult } from "@/types/pseo";
import type { FAQItem } from "@/lib/seo/faqData";
import { getCountryName } from "@/lib/seo/faqData";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

interface JsonLdSchemaProps {
    routeContext: RouteContext;
    result?: CalculationResult | null;
    faqs: FAQItem[];
    canonicalUrl: string;
    productName: string;
    originCountryName: string;
}

function buildBreadcrumbSchema(
    routeContext: RouteContext,
    productName: string,
    originCountryName: string,
    canonicalUrl: string,
) {
    const items = [
        { name: "Home", url: BASE_URL },
        { name: "Import Duty Calculator", url: `${BASE_URL}/import-duty-vat-landed-cost` },
    ];

    if (routeContext.pageType === "product_origin_money_page" && routeContext.clusterSlug) {
        items.push({ name: productName, url: `${BASE_URL}/import-duty-vat-landed-cost/${routeContext.clusterSlug}` });
        items.push({ name: `from ${originCountryName}`, url: canonicalUrl });
    } else if (routeContext.pageType === "hs_origin_money_page" && routeContext.hs6) {
        items.push({ name: `HS ${routeContext.hs6}`, url: `${BASE_URL}/import-duty-vat-landed-cost/hs/${routeContext.hs6}` });
        items.push({ name: `from ${originCountryName}`, url: canonicalUrl });
    }

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

function buildProductSchema(
    productName: string,
    originCountryName: string,
    canonicalUrl: string,
    description: string,
) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `Import Duty Calculator: ${productName} from ${originCountryName}`,
        description,
        url: canonicalUrl,
        brand: {
            "@type": "Organization",
            name: "ImportCosts",
        },
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "ZAR",
            availability: "https://schema.org/InStock",
            description: "Free instant landed cost calculator",
        },
    };
}

function buildFAQSchema(faqs: FAQItem[]) {
    if (faqs.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

function buildWebAppSchema(productName: string, canonicalUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: `${productName} Import Duty Calculator`,
        url: canonicalUrl,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "ZAR",
        },
        featureList: [
            "Customs duty calculation",
            "VAT calculation",
            "Landed cost estimation",
            "Preferential trade agreement analysis",
            "Document checklist generator",
            "Compliance risk assessment",
        ],
    };
}

export function JsonLdSchema({
    routeContext,
    result,
    faqs,
    canonicalUrl,
    productName,
    originCountryName,
}: JsonLdSchemaProps) {
    const description = routeContext.pageType === "product_origin_money_page"
        ? `Calculate import duties, VAT, and total landed cost for ${productName} from ${originCountryName} to South Africa. Instant estimates using the latest SARS tariff schedule.`
        : `Calculate import duties and landed cost for HS code ${routeContext.hs6} from ${originCountryName} to South Africa. Check duty rates, VAT, and compliance requirements.`;

    const schemas: Record<string, unknown>[] = [
        buildBreadcrumbSchema(routeContext, productName, originCountryName, canonicalUrl),
        buildProductSchema(productName, originCountryName, canonicalUrl, description),
        buildWebAppSchema(productName, canonicalUrl),
    ];

    const faqSchema = buildFAQSchema(faqs);
    if (faqSchema) schemas.push(faqSchema);

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
