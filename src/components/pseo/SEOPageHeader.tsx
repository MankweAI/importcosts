/**
 * SEOPageHeader.tsx
 *
 * Redesigned hero section with:
 * - Breadcrumb navigation
 * - Decision-tool H1 ("Business Viability Guide")
 * - Contextual intro paragraph (decision-language)
 * - Trust signal badges
 */

import { Badge } from "@/components/ui/badge";
import type { RouteContext } from "@/types/pseo";
import { ChevronRight, Shield, Calendar, BookOpen } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

interface SEOPageHeaderProps {
    routeContext: RouteContext;
    productName: string;
    originCountryName: string;
    tariffVersionLabel?: string;
    bestHs6?: string | null;
}

/* ─── Flag Emoji from ISO Code ─── */
function countryFlag(iso: string): string {
    const code = iso.toUpperCase();
    if (code.length !== 2) return "🌍";
    const offset = 0x1f1e6;
    return String.fromCodePoint(
        code.charCodeAt(0) - 0x41 + offset,
        code.charCodeAt(1) - 0x41 + offset,
    );
}

/* ─── Breadcrumbs ─── */
function Breadcrumbs({
    routeContext,
    productName,
    originCountryName,
}: {
    routeContext: RouteContext;
    productName: string;
    originCountryName: string;
}) {
    const crumbs: { label: string; href?: string }[] = [
        { label: "Home", href: "/" },
        { label: "Import Viability", href: "/import-duty-vat-landed-cost" },
    ];

    if (routeContext.pageType === "product_origin_money_page" && routeContext.clusterSlug) {
        crumbs.push({ label: productName });
        crumbs.push({ label: `from ${originCountryName}` });
    } else if (routeContext.pageType === "hs_origin_money_page" && routeContext.hs6) {
        crumbs.push({ label: `HS ${routeContext.hs6}` });
        crumbs.push({ label: `from ${originCountryName}` });
    }

    return (
        <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-400">
                {crumbs.map((crumb, i) => (
                    <li key={i} className="flex items-center gap-1">
                        {i > 0 && (
                            <ChevronRight className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                        )}
                        {crumb.href ? (
                            <a
                                href={crumb.href}
                                className="hover:text-neutral-700 transition-colors"
                            >
                                {crumb.label}
                            </a>
                        ) : (
                            <span className="text-neutral-600 font-medium">
                                {crumb.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/* ─── Contextual Intro ─── */
function buildIntroText(
    routeContext: RouteContext,
    productName: string,
    originCountryName: string,
    bestHs6?: string | null,
): string {
    if (routeContext.pageType === "product_origin_money_page") {
        const hsNote = bestHs6
            ? ` We auto-match ${productName} to HS code ${bestHs6} for precise duty lookup.`
            : "";
        return `Should you import ${productName} from ${originCountryName}? Enter your numbers below to instantly see your landed cost, gross margin, and a Go/Caution/No-Go verdict. Our engine uses the latest SARS tariff schedule and checks applicable trade agreements to find your lowest legal rate.${hsNote}`;
    }

    return `Is this deal worth it? See the true landed cost, margin impact, and risk profile for goods classified under HS ${routeContext.hs6} from ${originCountryName} to South Africa. Get a data-backed verdict before you commit capital.`;
}

export function SEOPageHeader({
    routeContext,
    productName,
    originCountryName,
    tariffVersionLabel,
    bestHs6,
}: SEOPageHeaderProps) {
    const isClusterPage = routeContext.pageType === "product_origin_money_page";
    const flag = countryFlag(routeContext.originIso);

    const h1 = isClusterPage
        ? `Import ${productName} from ${originCountryName}: Business Viability Guide`
        : `HS ${routeContext.hs6} from ${originCountryName}: Import Viability Assessment`;

    const introText = buildIntroText(routeContext, productName, originCountryName, bestHs6);

    const now = new Date();
    const monthYear = now.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

    return (
        <header className="mb-10 space-y-5">
            <Breadcrumbs
                routeContext={routeContext}
                productName={productName}
                originCountryName={originCountryName}
            />

            {/* H1 — Decision Language */}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {h1}
            </h1>

            {/* Contextual Intro */}
            <p className="text-base text-neutral-600 max-w-3xl leading-relaxed">
                {introText}
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge
                    variant="secondary"
                    className="text-xs gap-1.5 py-1 px-2.5 bg-neutral-100"
                >
                    <span className="text-sm leading-none">{flag}</span>
                    {originCountryName} → South Africa
                </Badge>

                {bestHs6 && (
                    <Badge
                        variant="outline"
                        className="text-xs font-mono gap-1.5 py-1 px-2.5"
                    >
                        <BookOpen className="h-3 w-3" />
                        HS {bestHs6}
                    </Badge>
                )}

                <Badge
                    variant="secondary"
                    className="text-xs gap-1.5 py-1 px-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                    <Shield className="h-3 w-3" />
                    SARS Tariff Book
                </Badge>

                <Badge
                    variant="secondary"
                    className="text-xs gap-1.5 py-1 px-2.5 bg-blue-50 text-blue-700 border border-blue-200"
                >
                    <Calendar className="h-3 w-3" />
                    Updated {monthYear}
                </Badge>
            </div>
        </header>
    );
}
