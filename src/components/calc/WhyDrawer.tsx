"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalcLineItem, CalcOutput } from "@/lib/calc/types";
import { ExternalLink, FileText, History } from "lucide-react";

interface WhyDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: CalcLineItem | null;
    context?: CalcOutput; // Full result context for global info
}

export function WhyDrawer({ isOpen, onClose, item, context }: WhyDrawerProps) {
    if (!item) return null;

    // Filter audit trace for this item
    // Mapping item.id to Audit Step prefixes
    const auditKeyword = item.id.toUpperCase(); // e.g., 'DUTY' -> 'DUTY_CALC'
    const relatedLogs = context?.auditTrace.filter(step =>
        step.step.includes(auditKeyword) || step.step === "RATE_LOOKUP"
    ) || [];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Audit Trace
                        </Badge>
                        {context?.tariffVersionLabel && (
                            <Badge variant="secondary" className="text-xs">
                                Tariff: {context.tariffVersionLabel}
                            </Badge>
                        )}
                    </div>
                    <SheetTitle className="text-2xl font-bold mt-2">{item.label}</SheetTitle>
                    <SheetDescription>
                        Transparent explanation of this cost component.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-8">
                    {/* Main Amount */}
                    <div className="flex flex-col space-y-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Calculated Amount</span>
                        <div className="text-4xl font-bold tracking-tight text-primary">
                            {item.currency} {item.amount.toFixed(2)}
                        </div>
                    </div>

                    <Separator />

                    {/* How it's calculated */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold text-lg">Calculation Logic</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-muted-foreground">Formula:</span>
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                                    {item.formula || "Standard Calc"}
                                </code>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-muted-foreground">Rate:</span>
                                <span className="font-medium">{item.rateApplied || "N/A"}</span>
                            </div>
                            {item.notes && (
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-muted-foreground">Notes:</span>
                                    <span>{item.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit Logs */}
                    {relatedLogs.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-lg">Engine Trace</h4>
                            </div>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-black/5 dark:bg-white/5">
                                <div className="space-y-4">
                                    {relatedLogs.map((log, i) => (
                                        <div key={i} className="flex flex-col space-y-1 text-sm">
                                            <div className="flex items-start justify-between">
                                                <span className="font-semibold text-xs text-muted-foreground">{log.step}</span>
                                                <span className="text-[10px] text-muted-foreground opacity-50">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground">{log.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    <Separator />

                    {/* Citations */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Official Sources</h4>
                        <a
                            href="#"
                            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors group"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">SARS Tariff Book (Chapter 85)</span>
                                <span className="text-xs text-muted-foreground">Source of Duty Rate</span>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </a>
                    </div>

                    <div className="text-[10px] text-muted-foreground text-center pt-4">
                        Calculation ID: {item.id} • Version: {context?.tariffVersionId.substring(0, 8)}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
