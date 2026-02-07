import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPageBySlug as getSeoPage } from "@/lib/db/services/seoPage.service";
import { getClusterWithHsCodes } from "@/lib/db/services/productCluster.service";
import { SeoPageHero } from "@/components/seo/SeoPageHero";
import { SeoFaqBlock } from "@/components/seo/SeoFaqBlock";
import { CalcCard } from "@/components/calc/CalcCard";
import { getCountryByIso2 } from "@/lib/db/services/country.service";
import { ComputedScenariosBlock } from "@/components/seo/ComputedScenariosBlock";
import { OriginComparisonBlock } from "@/components/seo/OriginComparisonBlock";
import { DocsChecklist } from "@/components/seo/DocsChecklist";

interface PageProps {
    params: Promise<{
        clusterSlug: string;
        originIso: string;
        destIso: string;
    }>;
}

// 1. Generate Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { clusterSlug, originIso, destIso } = await params;
    const slug = `/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso}/to/${destIso}`;
    const page = await getSeoPage(slug);

    if (!page) return { title: "Not Found" };

    // INDEX GATE Logic
    const robots = page.indexStatus === "INDEX"
        ? "index, follow"
        : "noindex, nofollow";

    const clusterName = page.productCluster?.name || clusterSlug;
    const originName = page.origin?.name || originIso;
    const destName = page.dest?.name || destIso;

    return {
        title: `Import Duty on ${clusterName} from ${originName} to ${destName} | LandedCost`,
        description: `Calculate updated 2026 import duty and VAT for transporting ${clusterName} from ${originName} to ${destName}. Get accurate HS code classification and landed cost estimates.`,
        robots: robots,
        alternates: {
            canonical: page.canonicalSlug || slug,
        }
    };
}

// 2. Page Component
export default async function SeoLandingPage({ params }: PageProps) {
    const { clusterSlug, originIso, destIso } = await params;

    // DB Lookup
    const slug = `/import-duty-vat-landed-cost/${clusterSlug}/from/${originIso}/to/${destIso}`;
    const page = await getSeoPage(slug);

    if (!page) {
        notFound();
    }

    // Get Primary HS Code
    const cluster = await getClusterWithHsCodes(clusterSlug);
    // Logic: Pick highest confidence HS code mapping, fallback if none
    const primaryHsMap = cluster?.hsMaps?.[0];
    const defaultHsCode = primaryHsMap?.hsCode?.hs6 || "854143"; // Default fallback if data missing

    // Get Names for Display
    const origin = await getCountryByIso2(originIso);
    const dest = await getCountryByIso2(destIso);

    // Dynamic Text
    const clusterName = page.productCluster?.name || clusterSlug; // "Solar Panels"
    const originName = origin?.name || originIso;
    const destName = dest?.name || destIso;


    return (
        <main className="min-h-screen bg-background">
            {/* HER0 */}
            <SeoPageHero
                clusterName={clusterName}
                originName={originName}
                destName={destName}
                indexStatus={page.indexStatus}
            />

            {/* CALCULATOR SECTION */}
            <section id="calculator" className="py-12 px-4 -mt-12 relative z-10 container mx-auto">
                <CalcCard
                    defaultHsCode={defaultHsCode}
                    className="shadow-2xl border-t-4 border-primary"
                />
            </section>

            {/* COMPUTED SCENARIOS (Indexable Content) */}
            {page.indexStatus === "INDEX" && (
                <section className="py-8 container mx-auto max-w-4xl px-4 space-y-8">
                    <ComputedScenariosBlock
                        clusterName={clusterName}
                        hsCode={defaultHsCode}
                    />

                    <OriginComparisonBlock
                        clusterSlug={clusterSlug}
                        currentOriginIso={originIso.toUpperCase()}
                        hsCode={defaultHsCode}
                    />

                    <DocsChecklist
                        hsCode={defaultHsCode}
                        originCountry={originIso}
                    />
                </section>
            )}

            {/* CONTENT BLOCKS */}
            <section className="py-12 bg-white dark:bg-black">

                <SeoFaqBlock
                    clusterName={clusterName}
                    dutyRateText="Standard Duty (check HS code)" // Placeholder, ideally dynamic from TariffService
                    originName={originName}
                    destName={destName}
                />
            </section>
        </main>
    );
}
