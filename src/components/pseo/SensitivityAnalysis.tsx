/**
 * SensitivityAnalysis.tsx
 *
 * GAP-07: What-if analysis for FX moves and duty rate changes.
 * Shows importers how external factors impact their landed cost.
 * SSR-rendered — pure server component.
 */

interface SensitivityAnalysisProps {
    landedCost: number;
    customsValue: number;
    dutyRate: number; // percentage, e.g. 20 for 20%
    dutyAmount: number;
    exchangeRate: number;
    invoiceValue: number;
}

function fmtR(n: number): string {
    return `R${Math.round(Math.abs(n)).toLocaleString("en-ZA")}`;
}

function fmtSign(n: number): string {
    return n >= 0 ? `+${fmtR(n)}` : `-${fmtR(n)}`;
}

export function SensitivityAnalysis({
    landedCost,
    customsValue,
    dutyRate,
    dutyAmount,
    exchangeRate,
    invoiceValue,
}: SensitivityAnalysisProps) {
    // FX sensitivity: ±10% move in exchange rate
    // When ZAR weakens by 10% (rate goes up 10%), invoice value in ZAR increases proportionally
    const fxUp10 = invoiceValue * 0.10; // additional cost if rate goes up 10%
    const fxDown10 = invoiceValue * 0.10; // savings if rate goes down 10%

    // Duty rate sensitivity: +5pp increase in duty rate
    const dutyIncrease5pp = customsValue * 0.05;
    // Also ripple effect on VAT (duty feeds into ATV)
    const vatOnDutyIncrease = dutyIncrease5pp * 0.15;
    const totalDutyImpact = dutyIncrease5pp + vatOnDutyIncrease;

    // Combined worst case
    const worstCase = fxUp10 + totalDutyImpact;
    const worstCasePct = (worstCase / landedCost * 100).toFixed(1);

    const scenarios = [
        {
            title: "ZAR Weakens 10%",
            subtitle: `USD/ZAR moves from ${exchangeRate.toFixed(2)} → ${(exchangeRate * 1.1).toFixed(2)}`,
            impact: fxUp10,
            direction: "up" as const,
            detail: "Your invoice value in ZAR increases proportionally, raising landed cost.",
        },
        {
            title: "ZAR Strengthens 10%",
            subtitle: `USD/ZAR moves from ${exchangeRate.toFixed(2)} → ${(exchangeRate * 0.9).toFixed(2)}`,
            impact: -fxDown10,
            direction: "down" as const,
            detail: "Your invoice value in ZAR decreases, lowering landed cost.",
        },
        {
            title: "Duty Rate +5pp",
            subtitle: `Duty increases from ${dutyRate.toFixed(0)}% → ${(dutyRate + 5).toFixed(0)}%`,
            impact: totalDutyImpact,
            direction: "up" as const,
            detail: `Extra duty: ${fmtR(dutyIncrease5pp)} + cascading VAT: ${fmtR(vatOnDutyIncrease)}.`,
        },
    ];

    return (
        <section className="mt-10 mb-8" aria-labelledby="sensitivity-heading">
            <h2
                id="sensitivity-heading"
                className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl"
            >
                Sensitivity Analysis
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                How external factors could shift your landed cost.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {scenarios.map((s, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-sm font-semibold text-neutral-900 mb-1">{s.title}</h3>
                        <p className="text-xs text-neutral-500 mb-3">{s.subtitle}</p>
                        <div className={`text-2xl font-bold mb-2 ${s.direction === "up" ? "text-red-600" : "text-emerald-600"}`}>
                            {fmtSign(s.impact)}
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed">{s.detail}</p>
                    </div>
                ))}
            </div>

            {/* Worst-case banner */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <span className="text-red-600 text-lg mt-0.5">⚠️</span>
                <div>
                    <p className="text-sm font-semibold text-red-800">
                        Combined worst case: {fmtSign(worstCase)} ({worstCasePct}% increase)
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                        If ZAR weakens 10% AND duty rate rises 5pp simultaneously, your landed cost would
                        increase from {fmtR(landedCost)} to {fmtR(landedCost + worstCase)}.
                    </p>
                </div>
            </div>
        </section>
    );
}
