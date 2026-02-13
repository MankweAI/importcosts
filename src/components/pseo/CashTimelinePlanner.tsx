
"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Wallet } from "lucide-react";

interface CashTimelinePlannerProps {
    totalLandedCost: number;
    dutyAmount: number;
    vatAmount: number;
    freightAmount: number;
    supplierDepositPct?: number; // default 30%
    transitDays?: number; // default 35 (Sea)
}

export function CashTimelinePlanner({
    totalLandedCost,
    dutyAmount,
    vatAmount,
    freightAmount,
    supplierDepositPct = 30,
    transitDays = 35
}: CashTimelinePlannerProps) {

    // Simple Model:
    // T-0: Deposit (30% of Product)
    // T+Transit: Balance (70%) + Freight
    // T+Arrival: Duty + VAT + Clearing

    const productCost = totalLandedCost - dutyAmount - vatAmount - freightAmount;
    const depositAmt = productCost * (supplierDepositPct / 100);
    const balanceAmt = productCost - depositAmt;
    const arrivalAmt = dutyAmount + vatAmount; // + clearing ideally

    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-neutral-500" />
                Cash Flow Planner
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
                Estimated cash requirement timeline for this shipment.
            </p>

            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-neutral-200 md:left-0 md:right-0 md:top-6 md:h-px md:w-full md:bottom-auto"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1: Order */}
                    <div className="relative pl-12 md:pl-0 md:pt-12">
                        <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-neutral-900 md:left-0 md:top-4 md:-translate-y-1/2 md:-ml-2 ring-4 ring-white"></div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Today</div>
                        <h4 className="font-bold text-neutral-900 mb-2">Order Deposit</h4>
                        <div className="text-2xl font-mono text-neutral-900 whitespace-nowrap">
                            R {depositAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            {supplierDepositPct}% of Goods Value
                        </p>
                    </div>

                    {/* Step 2: Shipment */}
                    <div className="relative pl-12 md:pl-0 md:pt-12">
                        <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-neutral-400 md:left-1/2 md:top-4 md:-translate-y-1/2 ring-4 ring-white"></div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1 md:justify-center">
                            ~ Day {Math.round(transitDays * 0.8)}
                            <ArrowRight className="w-3 h-3" />
                        </div>
                        <h4 className="font-bold text-neutral-900 mb-2 md:text-center">Balance & Freight</h4>
                        <div className="text-2xl font-mono text-neutral-900 whitespace-nowrap md:text-center">
                            R {(balanceAmt + freightAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 md:text-center">
                            Supplier Balance + Shipping
                        </p>
                    </div>

                    {/* Step 3: Arrival */}
                    <div className="relative pl-12 md:pl-0 md:pt-12">
                        <div className="absolute left-2 top-2 w-4 h-4 rounded-full bg-verdict-caution md:right-0 md:left-auto md:top-4 md:-translate-y-1/2 md:-mr-2 ring-4 ring-white"></div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 md:text-right">
                            ~ Day {transitDays}
                        </div>
                        <h4 className="font-bold text-neutral-900 mb-2 md:text-right">Customs & VAT</h4>
                        <div className="text-2xl font-mono text-neutral-900 whitespace-nowrap md:text-right">
                            R {arrivalAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 md:text-right text-verdict-caution font-medium">
                            Urgent Payment Required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
