/**
 * DealSummaryCard.tsx
 *
 * GAP-01: Top-of-page verdict card showing landed cost, margin, break-even,
 * risk score, and GO/CAUTION/NO-GO verdict badge. SSR-rendered for SEO.
 * Replaces the simpler DealOverviewSection.
 */

interface DealSummaryCardProps {
    invoiceValue: number;
    dutyAmount: number;
    vatAmount: number;
    freightCost: number;
    landedCost: number;
    landedCostPerUnit?: number;
    units?: number;
    verdict?: "GO" | "CAUTION" | "NOGO";
    grossMarginPct?: number | null;
    breakEvenPrice?: number | null;
    riskScore?: number; // 0-100
    productName: string;
    originName: string;
}

function formatZAR(amount: number): string {
    return `R ${Math.round(amount).toLocaleString("en-ZA")}`;
}

const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string; label: string; emoji: string }> = {
    GO: {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-300",
        label: "GO — Viable Deal",
        emoji: "✅",
    },
    CAUTION: {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-300",
        label: "CAUTION — Tight Margins",
        emoji: "⚠️",
    },
    NOGO: {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-300",
        label: "NO-GO — Unprofitable",
        emoji: "🛑",
    },
};

export function DealSummaryCard({
    invoiceValue,
    dutyAmount,
    vatAmount,
    freightCost,
    landedCost,
    landedCostPerUnit,
    units = 1,
    verdict,
    grossMarginPct,
    breakEvenPrice,
    riskScore,
    productName,
    originName,
}: DealSummaryCardProps) {
    const vs = verdict ? VERDICT_STYLES[verdict] : null;
    const perUnit = landedCostPerUnit ?? landedCost / units;

    const costRows = [
        { label: "Invoice Value", value: formatZAR(invoiceValue) },
        { label: "Customs Duty", value: `+ ${formatZAR(dutyAmount)}` },
        { label: "VAT (15%)", value: `+ ${formatZAR(vatAmount)}` },
        { label: "Freight & Insurance", value: `+ ${formatZAR(freightCost)}` },
    ];

    return (
        <section className="mt-10 mb-8" aria-labelledby="deal-summary-heading">
            <h2
                id="deal-summary-heading"
                className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl"
            >
                Deal Summary
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                At-a-glance profitability analysis for importing {productName} from {originName}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ── Left: Verdict + Key Numbers ── */}
                <div className="md:col-span-1 space-y-4">
                    {/* Verdict Badge */}
                    {vs && (
                        <div className={`rounded-xl border-2 ${vs.border} ${vs.bg} p-5 text-center`}>
                            <span className="text-3xl block mb-1">{vs.emoji}</span>
                            <span className={`text-lg font-bold ${vs.text}`}>{vs.label}</span>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
                            <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Landed Cost</span>
                            <span className="text-lg font-bold text-neutral-900">{formatZAR(landedCost)}</span>
                            {units > 1 && (
                                <span className="block text-xs text-neutral-400 mt-0.5">{formatZAR(perUnit)} / unit</span>
                            )}
                        </div>
                        {grossMarginPct !== undefined && grossMarginPct !== null && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
                                <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Gross Margin</span>
                                <span className={`text-lg font-bold ${grossMarginPct >= 25 ? "text-emerald-700" : grossMarginPct >= 12 ? "text-amber-700" : "text-red-700"}`}>
                                    {grossMarginPct.toFixed(1)}%
                                </span>
                            </div>
                        )}
                        {breakEvenPrice !== undefined && breakEvenPrice !== null && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
                                <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Break-Even Price</span>
                                <span className="text-lg font-bold text-neutral-900">{formatZAR(breakEvenPrice)}</span>
                            </div>
                        )}
                        {riskScore !== undefined && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
                                <span className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Risk Score</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-lg font-bold ${riskScore <= 30 ? "text-emerald-700" : riskScore <= 60 ? "text-amber-700" : "text-red-700"}`}>
                                        {riskScore}/100
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className={`h-1.5 rounded-full ${riskScore <= 30 ? "bg-emerald-500" : riskScore <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                        style={{ width: `${riskScore}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Cost Waterfall ── */}
                <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                        <h3 className="text-sm font-semibold text-neutral-700">Cost Breakdown</h3>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {costRows.map((row, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                                <span className="text-neutral-600">{row.label}</span>
                                <span className="font-medium text-neutral-900">{row.value}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                            <span className="font-semibold text-neutral-900">Total Landed Cost</span>
                            <span className="text-xl font-bold text-neutral-900">{formatZAR(landedCost)}</span>
                        </div>

                        {/* Margin at selling price (if we have break-even, show implied selling target) */}
                        {grossMarginPct !== undefined && grossMarginPct !== null && breakEvenPrice && (
                            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-neutral-50 to-white text-sm">
                                <span className="text-neutral-600">
                                    Minimum sell price to break even
                                </span>
                                <span className="font-semibold text-neutral-900">{formatZAR(breakEvenPrice)} / unit</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
