"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { ArrowRight, Phone, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrokerHandoffCTA() {
    const { result, status } = usePSEOCalculatorStore();

    if (status !== 'success' || !result) return null;

    const verdict = result.verdict || "CAUTION";

    if (verdict === "GO") {
        return (
            <div className="flex items-center justify-between p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
                        <Truck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900">Ready to ship?</p>
                        <p className="text-xs text-neutral-500">Get competitive freight quotes from verified forwarders.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    Get Quote <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    // CAUTION or NOGO → Lead gen CTA
    const isNogo = verdict === "NOGO";

    return (
        <div className={`p-6 rounded-2xl border-2 ${isNogo ? 'border-red-200 bg-gradient-to-br from-red-50 to-white' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-sm flex-shrink-0">
                    <ShieldCheck className={`h-6 w-6 ${isNogo ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900">
                        {isNogo
                            ? "This deal needs expert structuring."
                            : "Don't leave margin on the table."
                        }
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                        {isNogo
                            ? "A licensed customs broker can identify duty savings, restructure the deal, and help avoid compliance penalties."
                            : "A specialist can optimize tariff classification, explore preferential rates, and improve your margin by 5-15%."
                        }
                    </p>
                </div>
                <Button
                    size="lg"
                    className={`gap-2 rounded-xl shadow-sm flex-shrink-0 ${isNogo
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                >
                    <Phone className="h-4 w-4" />
                    Talk to a Broker
                </Button>
            </div>
        </div>
    );
}
