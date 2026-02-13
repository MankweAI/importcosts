import React from "react";
import { ChevronDown, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HSConfidence } from "@/types/pseo";

interface HSAlternative {
    hs6: string;
    label: string;
    confidence_score: number;
}

interface HSCodePickerProps {
    currentHs: string;
    confidence: HSConfidence;
    alternatives?: HSAlternative[];
    onSelect?: (hs6: string) => void;
    className?: string;
    readOnly?: boolean;
}

export function HSCodePicker({
    currentHs,
    confidence,
    alternatives = [],
    onSelect,
    className,
    readOnly = false,
}: HSCodePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const confidenceConfig = {
        high: { color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Verified" },
        medium: { color: "text-amber-600 bg-amber-50 border-amber-200", icon: HelpCircle, label: "Ambiguous" },
        low: { color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle, label: "Uncertain" },
        unknown: { color: "text-neutral-500 bg-neutral-100 border-neutral-200", icon: HelpCircle, label: "Unknown" },
    };

    const config = confidenceConfig[confidence] || confidenceConfig.unknown;
    const Icon = config.icon;

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm transition-all",
                    readOnly ? "opacity-90 cursor-default" : "cursor-pointer hover:border-neutral-400",
                    isOpen ? "ring-2 ring-neutral-900 border-transparent" : "border-neutral-300"
                )}
                onClick={() => !readOnly && alternatives.length > 0 && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
                            HS / Commodity Code
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-mono font-bold text-neutral-900">
                                {currentHs}
                            </span>
                            <span className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                config.color
                            )}>
                                <Icon className="w-3 h-3" />
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {!readOnly && alternatives.length > 0 && (
                    <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
                )}
            </div>

            {/* Alternatives Dropdown */}
            {isOpen && alternatives.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200">
                        <span className="text-xs font-semibold text-neutral-600">Select Alternative Classification</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {alternatives.map((alt) => (
                            <button
                                key={alt.hs6}
                                onClick={() => {
                                    onSelect?.(alt.hs6);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-2 rounded hover:bg-neutral-100 transition-colors flex items-start gap-3 group"
                            >
                                <span className="font-mono font-bold text-neutral-900 group-hover:text-blue-600">
                                    {alt.hs6}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-700 truncate">{alt.label}</p>
                                    <p className="text-xs text-neutral-400">Match Score: {Math.round(alt.confidence_score * 100)}%</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
