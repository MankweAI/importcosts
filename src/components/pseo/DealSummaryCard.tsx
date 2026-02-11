
/**
 * DealSummaryCard.tsx
 *
 * NOW: The "Header" of the Pro Forma Invoice.
 * Contains: Title, Date, Invoice #, Vendor/Bill-To info, and the Verdict Stamp.
 * Does NOT contain the line items (moved to InvoiceCalculator).
 */

import { FileText, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

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

const VERDICT_CONFIG = {
    GO: {
        label: "VIABLE",
        color: "text-emerald-700",
        borderColor: "border-emerald-700",
        bgColor: "bg-emerald-50",
        stampColor: "text-emerald-700 border-emerald-700",
    },
    CAUTION: {
        label: "CAUTION",
        color: "text-amber-700",
        borderColor: "border-amber-700",
        bgColor: "bg-amber-50",
        stampColor: "text-amber-700 border-amber-700",
    },
    NOGO: {
        label: "UNPROFITABLE",
        color: "text-red-700",
        borderColor: "border-red-700",
        bgColor: "bg-red-50",
        stampColor: "text-red-700 border-red-700",
    },
};

export function DealSummaryCard({
    verdict,
    productName,
    originName,
    units = 1,
}: DealSummaryCardProps) {
    const vc = verdict ? VERDICT_CONFIG[verdict] : null;
    const dateStr = new Date().toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="relative">
            {/* ── Header ── */}
            <div className="p-8 pb-4 flex justify-between items-start border-b border-neutral-100">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-neutral-400" />
                        <h2 id="invoice-heading" className="text-xl font-bold text-neutral-900 tracking-tight">
                            ESTIMATED LANDED COST
                        </h2>
                    </div>
                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
                        Pro Forma Estimate &bull; #{Math.floor(Math.random() * 89999 + 10000)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">ImportCosts.co.za</p>
                    <p className="text-xs text-neutral-500">{dateStr}</p>
                </div>
            </div>

            {/* ── Bill To / Ship To ── */}
            <div className="p-8 py-6 grid grid-cols-2 gap-8 text-sm">
                <div>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Importing From</h3>
                    <p className="font-semibold text-neutral-900">{originName}</p>
                    <p className="text-neutral-500">Vendor: [Supplier Name]</p>
                    <p className="text-neutral-500">Incoterm: FOB (Assumed)</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Destination</h3>
                    <p className="font-semibold text-neutral-900">South Africa</p>
                    <p className="text-neutral-500">{productName}</p>
                    <p className="text-neutral-500">Qty: {units.toLocaleString()}</p>
                </div>
            </div>

            {/* ── STAMP WATERMARK ── */}
            {vc && (
                <div className="absolute top-6 right-8 rotate-[-12deg] pointer-events-none select-none opacity-80 mix-blend-multiply z-10">
                    <div className={`border-[3px] rounded-lg px-3 py-1 text-center uppercase tracking-widest font-black text-lg ${vc.stampColor}`}>
                        {vc.label}
                    </div>
                </div>
            )}
        </div>
    );
}
