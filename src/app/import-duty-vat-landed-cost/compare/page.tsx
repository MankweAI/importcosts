import { Metadata } from "next";
import Link from "next/link";
import { ExampleScenariosTable } from "@/components/pseo/ExampleScenariosTable";
import { RiskBullets } from "@/components/pseo/RiskBullets";
import type { ExampleScenario } from "@/lib/seo/scenarioData";
import type { RiskBullet } from "@/lib/seo/riskBulletData";
import { ArrowRight } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

export const metadata: Metadata = {
    title: "Compare Import Scenarios: CIF vs FOB, Small vs Bulk | ImportCosts",
    description: "See how changing shipment terms and volumes affects your South African import landed cost. Use these examples to guide negotiating better terms or order sizes.",
    alternates: {
        canonical: `${BASE_URL}/import-duty-vat-landed-cost/compare`,
    },
    robots: "index, follow",
    openGraph: {
        title: "Compare Import Scenarios | ImportCosts",
        description: "See how changing shipment terms and volumes affects your landed cost. Use these examples to guide negotiating better terms.",
        siteName: "ImportCosts",
        type: "website",
        locale: "en_ZA",
    },
};

// ─── Pre-built comparison scenarios ───
const COMPARISON_SCENARIOS: ExampleScenario[] = [
    {
        label: "Case A: 100 pcs via Sea (FOB)",
        quantity: 100,
        unitPrice: 5000,
        freightPerUnit: 350,
        freightMode: "Sea",
        incoterm: "FOB",
        dutyPct: 20,
        landedCostPerUnit: 7648,
        sellingPrice: 9500,
        marginPct: 19.5,
        verdict: "CAUTION",
    },
    {
        label: "Case B: 1,000 pcs via Sea (FOB)",
        quantity: 1000,
        unitPrice: 5000,
        freightPerUnit: 80,
        freightMode: "Sea",
        incoterm: "FOB",
        dutyPct: 20,
        landedCostPerUnit: 6940,
        sellingPrice: 9500,
        marginPct: 26.9,
        verdict: "GO",
    },
    {
        label: "Case C: 1,000 pcs via Air (CIF)",
        quantity: 1000,
        unitPrice: 5000,
        freightPerUnit: 600,
        freightMode: "Air",
        incoterm: "CIF",
        dutyPct: 20,
        landedCostPerUnit: 7636,
        sellingPrice: 9500,
        marginPct: 19.6,
        verdict: "CAUTION",
    },
];

const COMPARISON_RISKS: RiskBullet[] = [
    {
        icon: "freight",
        title: "Small shipments cost 20% more per unit",
        detail: "Freight is a fixed overhead. At 100 units, you absorb R350/unit vs R80/unit at 1,000 — a 19% swing in landed cost.",
    },
    {
        icon: "currency",
        title: "FOB vs CIF trade-offs",
        detail: "FOB gives you control over freight booking but exposes you to USD/ZAR risk on shipping. CIF simplifies logistics but hides the freight markup.",
    },
    {
        icon: "freight",
        title: "Air freight erodes margin",
        detail: "Air shipping (Case C) saves 25 days but costs R600/unit vs R80/unit by sea. Only viable for urgent or high-value goods.",
    },
    {
        icon: "compliance",
        title: "Consolidation can reduce costs",
        detail: "If ordering under a full container load (FCL), consider consolidation services to share container space and reduce per-unit freight.",
    },
];

export default function ScenarioComparisonPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5">
                    <li><Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link></li>
                    <li>/</li>
                    <li className="text-neutral-900 font-medium">Compare Scenarios</li>
                </ol>
            </nav>

            {/* H1 */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                Compare Import Scenarios: CIF vs FOB, Small vs Bulk
            </h1>
            <p className="text-neutral-600 leading-relaxed max-w-2xl mb-10">
                See how changing shipment terms and volumes affects your landed cost.
                Use these examples to guide negotiating better terms or order sizes.
            </p>

            {/* H2: Example Cases */}
            <ExampleScenariosTable
                scenarios={COMPARISON_SCENARIOS}
                title="Example Cases"
                subtitle="Three real-world import configurations showing how volume and shipping mode impact your bottom line."
            />

            {/* H2: Lessons Learned */}
            <section aria-labelledby="lessons-heading" className="mt-12 mb-8">
                <h2 id="lessons-heading" className="text-xl font-bold text-neutral-900 md:text-2xl mb-1">
                    Cost & Margin Impact
                </h2>
                <p className="text-sm text-neutral-500 mb-6 max-w-2xl">
                    Key takeaways from the scenarios above.
                </p>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Volume is your biggest lever</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            Moving from 100 to 1,000 units drops landed cost by R708/unit (9.3%) — pushing margin from CAUTION to GO territory.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 text-sm">Air freight halves your margin gain</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            Even at bulk volume, choosing air over sea erases nearly all the volume savings. Reserve air for time-critical orders.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 text-sm">CIF doesn&apos;t always mean more expensive</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            While you lose freight control, some suppliers offer competitive CIF rates. Always compare CIF quotes against your own FOB + freight.
                        </p>
                    </div>
                </div>
            </section>

            {/* Risk Bullets */}
            <RiskBullets
                bullets={COMPARISON_RISKS}
                title="Lessons Learned"
                subtitle="Common pitfalls when structuring import deals."
            />

            {/* Import Planning Checklist */}
            <section aria-labelledby="plan-checklist-heading" className="mt-12 mb-12">
                <h2 id="plan-checklist-heading" className="text-xl font-bold text-neutral-900 mb-6">
                    Action Checklist
                </h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <ul className="space-y-3">
                        {[
                            "Negotiate freight quotes from at least 3 forwarders (sea and air)",
                            "Consider consolidation services for orders under a full container",
                            "Plan for currency hedging or Letter of Credit terms on USD purchases",
                            "Request CIF and FOB pricing from your supplier to compare",
                            "Factor in warehousing costs at destination when comparing scenarios",
                            "Build a 5% margin buffer for exchange rate and freight volatility",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <div className="mt-0.5 rounded border border-neutral-200 bg-neutral-50 p-0.5 text-neutral-400">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-neutral-700">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-12 mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-center">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                    Simulate Your Own Scenario
                </h2>
                <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                    Enter your actual product, quantity, and shipping terms to get a personalised landed cost and margin analysis.
                </p>
                <Link
                    href="/import-duty-vat-landed-cost/solar-panels/from/cn/to/south-africa"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Open Deal Calculator
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </main>
    );
}
