/**
 * DealOverviewSection.tsx
 *
 * H2 "Deal Overview" section showing a cost vs. selling price summary.
 * SSR-rendered for SEO. Shows at-a-glance P&L: invoice → duties → freight → landed → margin.
 */

interface DealOverviewProps {
    invoiceValue: number;
    dutyAmount: number;
    vatAmount: number;
    freightCost: number;
    landedCost: number;
    sellingPrice?: number | null;
    marginPct?: number | null;
    productName: string;
    originName: string;
}

function formatZAR(amount: number): string {
    return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

export function DealOverviewSection({
    invoiceValue,
    dutyAmount,
    vatAmount,
    freightCost,
    landedCost,
    sellingPrice,
    marginPct,
    productName,
    originName,
}: DealOverviewProps) {
    const rows = [
        { label: "Invoice Value", value: formatZAR(invoiceValue), emphasis: false },
        { label: "Customs Duty", value: `+ ${formatZAR(dutyAmount)}`, emphasis: false },
        { label: "VAT (15%)", value: `+ ${formatZAR(vatAmount)}`, emphasis: false },
        { label: "Freight & Insurance", value: `+ ${formatZAR(freightCost)}`, emphasis: false },
    ];

    return (
        <section className="mt-12 mb-8" aria-labelledby="deal-overview-heading">
            <h2
                id="deal-overview-heading"
                className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl"
            >
                Deal Overview
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                Cost breakdown for importing {productName} from {originName} based on a R{invoiceValue.toLocaleString("en-ZA")} sample value.
            </p>

            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-neutral-100">
                    {rows.map((row, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                            <span className="text-neutral-600">{row.label}</span>
                            <span className="font-medium text-neutral-900">{row.value}</span>
                        </div>
                    ))}

                    {/* Landed Cost Total */}
                    <div className="flex items-center justify-between px-5 py-4 bg-neutral-50">
                        <span className="font-semibold text-neutral-900">Total Landed Cost</span>
                        <span className="text-lg font-bold text-neutral-900">{formatZAR(landedCost)}</span>
                    </div>

                    {/* Margin row (if selling price provided) */}
                    {sellingPrice && marginPct !== null && marginPct !== undefined && (
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-neutral-50 to-white">
                            <div>
                                <span className="font-semibold text-neutral-900">Gross Margin</span>
                                <span className="text-xs text-neutral-500 ml-2">
                                    (at {formatZAR(sellingPrice)} sell)
                                </span>
                            </div>
                            <span className={`text-lg font-bold ${marginPct >= 25 ? "text-emerald-700" : marginPct >= 12 ? "text-amber-700" : "text-red-700"}`}>
                                {marginPct.toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
