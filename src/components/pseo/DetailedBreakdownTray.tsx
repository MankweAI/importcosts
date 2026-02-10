"use client";

import { CalculationResult } from "@/types/pseo";

interface DetailedBreakdownTrayProps {
    result: CalculationResult;
    onClose?: () => void;
}

export function DetailedBreakdownTray({ result, onClose }: DetailedBreakdownTrayProps) {
    const fmt = (val: number) =>
        val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const today = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 font-mono text-sm overflow-hidden">

            {/* Receipt Header */}
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1">Estimated Landed Cost Breakdown</p>
                <p className="text-xs text-neutral-500">{today} &middot; HS {result.line_items?.[0]?.key ? 'Code Applied' : '—'}</p>
            </div>

            {/* Line Items */}
            <div className="px-6 py-3">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-neutral-400 pb-2 border-b border-dashed border-neutral-200 dark:border-neutral-700">
                    <span>Description</span>
                    <span>Amount (ZAR)</span>
                </div>

                {result.line_items.map((item, i) => (
                    <div
                        key={item.key}
                        className="flex justify-between items-baseline py-2.5 border-b border-dotted border-neutral-100 dark:border-neutral-800 last:border-b-0"
                    >
                        <div className="flex-1 min-w-0 pr-6">
                            <span className="text-neutral-700 dark:text-neutral-300 font-sans text-sm">
                                {item.label}
                            </span>
                            {item.audit?.formula && (
                                <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                                    {item.audit.formula}
                                </p>
                            )}
                        </div>
                        <span className="text-neutral-900 dark:text-neutral-100 tabular-nums whitespace-nowrap">
                            R {fmt(item.amount_zar)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="px-6 py-4 border-t-2 border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900">
                <div className="flex justify-between items-baseline">
                    <span className="font-sans font-semibold text-base text-neutral-900 dark:text-neutral-100">
                        Total Landed Cost
                    </span>
                    <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        R {fmt(result.summary.total_landed_cost_zar)}
                    </span>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-neutral-400 font-sans">Per unit</span>
                    <span className="text-xs text-neutral-500 tabular-nums">
                        R {fmt(result.summary.landed_cost_per_unit_zar)}
                    </span>
                </div>
            </div>

            {/* Close */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="w-full py-3 text-center text-sm font-sans text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
}
