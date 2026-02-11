/**
 * ExampleScenariosTable.tsx
 *
 * SSR-rendered table showing 3 pre-computed import scenarios.
 * Each row displays volume, freight mode, landed cost, margin, and verdict.
 */

import type { ExampleScenario } from "@/lib/seo/scenarioData";

interface ExampleScenariosTableProps {
    scenarios: ExampleScenario[];
    title?: string;
    subtitle?: string;
}

function formatZAR(amount: number): string {
    return `R${amount.toLocaleString("en-ZA")}`;
}

function VerdictBadge({ verdict }: { verdict: "GO" | "CAUTION" | "NOGO" }) {
    const styles = {
        GO: "bg-emerald-100 text-emerald-800 border-emerald-200",
        CAUTION: "bg-amber-100 text-amber-800 border-amber-200",
        NOGO: "bg-red-100 text-red-800 border-red-200",
    };
    const labels = { GO: "Go", CAUTION: "Caution", NOGO: "No Go" };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[verdict]}`}>
            {labels[verdict]}
        </span>
    );
}

export function ExampleScenariosTable({
    scenarios,
    title = "Example Scenarios",
    subtitle = "See how volume, freight mode, and terms affect your profitability.",
}: ExampleScenariosTableProps) {
    if (scenarios.length === 0) return null;

    return (
        <section className="mt-12 mb-8" aria-labelledby="scenarios-heading">
            <h2
                id="scenarios-heading"
                className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl"
            >
                {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl">
                {subtitle}
            </p>

            {/* Desktop table */}
            <div className="hidden md:block mt-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-neutral-200">
                            <th className="text-left py-3 px-3 font-semibold text-neutral-600">Scenario</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Qty</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Unit Price</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Freight/Unit</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Duty</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Landed/Unit</th>
                            <th className="text-right py-3 px-3 font-semibold text-neutral-600">Margin</th>
                            <th className="text-center py-3 px-3 font-semibold text-neutral-600">Verdict</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map((s, i) => (
                            <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                <td className="py-3 px-3 font-medium text-neutral-900">{s.label}</td>
                                <td className="py-3 px-3 text-right text-neutral-700">{s.quantity.toLocaleString()}</td>
                                <td className="py-3 px-3 text-right text-neutral-700">{formatZAR(s.unitPrice)}</td>
                                <td className="py-3 px-3 text-right text-neutral-700">{formatZAR(s.freightPerUnit)}</td>
                                <td className="py-3 px-3 text-right text-neutral-700">{s.dutyPct}%</td>
                                <td className="py-3 px-3 text-right font-semibold text-neutral-900">{formatZAR(s.landedCostPerUnit)}</td>
                                <td className={`py-3 px-3 text-right font-semibold ${s.marginPct >= 25 ? "text-emerald-700" : s.marginPct >= 12 ? "text-amber-700" : "text-red-700"}`}>
                                    {s.marginPct}%
                                </td>
                                <td className="py-3 px-3 text-center"><VerdictBadge verdict={s.verdict} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden mt-6 space-y-4">
                {scenarios.map((s, i) => (
                    <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-neutral-900">{s.label}</span>
                            <VerdictBadge verdict={s.verdict} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-neutral-500">Unit Price</div>
                            <div className="text-right text-neutral-900">{formatZAR(s.unitPrice)}</div>
                            <div className="text-neutral-500">Freight/Unit</div>
                            <div className="text-right text-neutral-900">{formatZAR(s.freightPerUnit)}</div>
                            <div className="text-neutral-500">Duty Rate</div>
                            <div className="text-right text-neutral-900">{s.dutyPct}%</div>
                            <div className="text-neutral-500 font-medium">Landed/Unit</div>
                            <div className="text-right font-bold text-neutral-900">{formatZAR(s.landedCostPerUnit)}</div>
                            <div className="text-neutral-500 font-medium">Margin</div>
                            <div className={`text-right font-bold ${s.marginPct >= 25 ? "text-emerald-700" : s.marginPct >= 12 ? "text-amber-700" : "text-red-700"}`}>
                                {s.marginPct}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
