"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { Home, Calculator, Bookmark, Bell, Menu } from "lucide-react";
import { ProfitTicker } from "@/components/mobile/ProfitTicker";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface MobileProfitLayoutProps {
    children: React.ReactNode;
}

export function MobileProfitLayout({ children }: MobileProfitLayoutProps) {
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
            {/* Header: Ticker Tape */}
            <header className="flex-none bg-white border-b border-slate-200 z-20">
                <ProfitTicker />
            </header>

            {/* Main Content: Scrollable Feed */}
            <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                <div className="max-w-md mx-auto md:max-w-3xl lg:max-w-5xl md:pt-8 md:px-6">
                    {children}
                </div>
            </main>

            {/* Bottom Nav: "App" Style */}
            <nav className="flex-none fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe z-30">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    <NavButton
                        icon={Home}
                        label="Dashboard"
                        active={activeTab === "dashboard"}
                        onClick={() => setActiveTab("dashboard")}
                    />
                    <NavButton
                        icon={Calculator}
                        label="Calculator"
                        active={activeTab === "calculator"}
                        onClick={() => setActiveTab("calculator")}
                    />
                    {/* Floating Action Button (FAB) for primary action? */}
                    <NavButton
                        icon={Bookmark}
                        label="Saved"
                        active={activeTab === "saved"}
                        onClick={() => setActiveTab("saved")}
                    />
                    <NavButton
                        icon={Bell}
                        label="Alerts"
                        active={activeTab === "alerts"}
                        onClick={() => setActiveTab("alerts")}
                    />
                </div>
            </nav>
        </div>
    );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <Icon className={cn("h-6 w-6", active && "fill-current/10")} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
