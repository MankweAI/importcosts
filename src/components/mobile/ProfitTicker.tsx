"use client";

import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";

export function ProfitTicker() {
    return (
        <div className="w-full overflow-hidden bg-slate-900 text-white text-xs font-mono py-2 relative">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

            <div className="flex whitespace-nowrap animate-ticker">
                {/* Ticker Items Loop */}
                <div className="flex gap-8 px-4 items-center">
                    <TickerItem label="USD/ZAR" value="18.42" change="+0.15%" trend="up" />
                    <TickerItem label="CNY/ZAR" value="2.54" change="-0.02%" trend="down" />
                    <TickerItem label="BRENT" value="$82.40" change="+1.2%" trend="up" />
                    <TickerItem label="GOLD" value="$2,024" change="+0.05%" trend="up" />
                    <TickerItem label="RKEP" value="HOLD" change="--" trend="flat" color="text-amber-400" />

                    {/* Duplicate for infinite loop illusion (simplified) */}
                    <span className="text-slate-600">|</span>

                    <TickerItem label="USD/ZAR" value="18.42" change="+0.15%" trend="up" />
                </div>
            </div>
        </div>
    );
}

function TickerItem({ label, value, change, trend, color }: any) {
    const isUp = trend === "up";
    const isDown = trend === "down";

    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">{label}</span>
            <span className={color || "text-white"}>{value}</span>
            <span className={`flex items-center ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-slate-500"}`}>
                {isUp && <TrendingUp className="w-3 h-3 mr-0.5" />}
                {isDown && <TrendingDown className="w-3 h-3 mr-0.5" />}
                {change}
            </span>
        </div>
    );
}
