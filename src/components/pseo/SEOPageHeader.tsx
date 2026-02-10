/**
 * SEOPageHeader.tsx
 *
 * Redesigned hero section for pSEO pages with:
 * - Breadcrumb navigation
 * - Keyword-dense H1
 * - Contextual intro paragraph (unique per route)
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
        { label: "Import Duties", href: "/import-duty-vat-landed-cost" },
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
            <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                {crumbs.map((crumb, i) => (
                    <li key={i} className="flex items-center gap-1">
                        {i > 0 && (
                            <ChevronRight className="h-3 w-3 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
                        )}
                        {crumb.href ? (
                            <a
                                href={crumb.href}
                                className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            >
                                {crumb.label}
                            </a>
                        ) : (
                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
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
            ? ` Our calculator automatically maps ${productName} to HS code ${bestHs6} for accurate duty rate lookup.`
            : "";
        return `Calculate the exact customs duty, 15% VAT, and total landed cost for importing ${productName} from ${originCountryName} into South Africa. Our calculator uses the latest SARS tariff schedule and checks applicable preferential trade agreements to ensure you pay the lowest legal rate.${hsNote}`;
    }

    return `Get accurate duty rates, VAT, and total landed cost for goods classified under Harmonized System code ${routeContext.hs6} imported from ${originCountryName} to South Africa. This calculator applies the current SARS tariff book rates, checks preferential trade agreement eligibility, and generates your customs documentation checklist.`;
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
        ? `Import Duty & VAT Calculator: ${productName} from ${originCountryName} to South Africa`
        : `Import Duty Calculator: HS ${routeContext.hs6} from ${originCountryName} to South Africa`;

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

            {/* H1 */}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {h1}
            </h1>

            {/* Contextual Intro */}
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
                {introText}
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge
                    variant="secondary"
                    className="text-xs gap-1.5 py-1 px-2.5 bg-neutral-100 dark:bg-neutral-800"
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
                    className="text-xs gap-1.5 py-1 px-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                >
                    <Shield className="h-3 w-3" />
                    Based on SARS Tariff Book
                </Badge>

                <Badge
                    variant="secondary"
                    className="text-xs gap-1.5 py-1 px-2.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                >
                    <Calendar className="h-3 w-3" />
                    Updated {monthYear}
                </Badge>
            </div>
        </header>
    );
}
