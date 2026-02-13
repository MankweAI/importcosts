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
    const style =
        verdict === "GO"
            ? "bg-sky-600 text-white"
            : verdict === "CAUTION"
                ? "bg-sky-700 text-white"
                : "bg-sky-800 text-white";

    const label = verdict === "NOGO" ? "No-Go" : verdict === "CAUTION" ? "Caution" : "Go";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide ${style}`}>{label}</span>;
}

export function ExampleScenariosTable({
    scenarios,
    title = "Example scenarios",
    subtitle = "Compare quantity, freight and margin outcomes before finalizing your order.",
}: ExampleScenariosTableProps) {
    if (scenarios.length === 0) return null;

    return (
        <section className="my-8" aria-labelledby="scenarios-heading">
            <h2 id="scenarios-heading" className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>

            <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Scenario</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Qty</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Unit Price</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Freight/Unit</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Duty</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Landed/Unit</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Margin</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Verdict</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenarios.map((scenario, index) => (
                            <tr key={index} className="border-b border-slate-100 last:border-b-0 hover:bg-sky-50/40">
                                <td className="px-3 py-3 font-medium text-slate-900">{scenario.label}</td>
                                <td className="px-3 py-3 text-right text-slate-700">{scenario.quantity.toLocaleString("en-ZA")}</td>
                                <td className="px-3 py-3 text-right text-slate-700">{formatZAR(scenario.unitPrice)}</td>
                                <td className="px-3 py-3 text-right text-slate-700">{formatZAR(scenario.freightPerUnit)}</td>
                                <td className="px-3 py-3 text-right text-slate-700">{scenario.dutyPct}%</td>
                                <td className="px-3 py-3 text-right font-semibold text-slate-900">{formatZAR(scenario.landedCostPerUnit)}</td>
                                <td className="px-3 py-3 text-right font-semibold text-slate-900">{scenario.marginPct}%</td>
                                <td className="px-3 py-3 text-center">
                                    <VerdictBadge verdict={scenario.verdict} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-5 space-y-3 md:hidden">
                {scenarios.map((scenario, index) => (
                    <article key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{scenario.label}</h3>
                            <VerdictBadge verdict={scenario.verdict} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-slate-500">Unit Price</span>
                            <span className="text-right text-slate-900">{formatZAR(scenario.unitPrice)}</span>
                            <span className="text-slate-500">Freight/Unit</span>
                            <span className="text-right text-slate-900">{formatZAR(scenario.freightPerUnit)}</span>
                            <span className="text-slate-500">Duty Rate</span>
                            <span className="text-right text-slate-900">{scenario.dutyPct}%</span>
                            <span className="font-medium text-slate-500">Landed/Unit</span>
                            <span className="text-right font-semibold text-slate-900">{formatZAR(scenario.landedCostPerUnit)}</span>
                            <span className="font-medium text-slate-500">Margin</span>
                            <span className="text-right font-semibold text-slate-900">{scenario.marginPct}%</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
