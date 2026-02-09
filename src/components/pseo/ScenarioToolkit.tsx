"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useCalculateLandedCost } from "@/hooks/useCalculateLandedCost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Ship, Plane, Info, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ScenarioToolkit() {
    const { inputs, updateInput } = usePSEOCalculatorStore();
    const { calculate } = useCalculateLandedCost();

    const presets = [10000, 50000, 250000];

    const applyPreset = (val: number) => {
        updateInput('invoiceValue', val);
        setTimeout(calculate, 0);
    };

    const freightProfiles = [
        { id: 'sea_conservative', label: 'Sea (Est)', text: '~12%', icon: Ship, rate: 0.12, insuranceRate: 0.01 },
        { id: 'air_conservative', label: 'Air (Est)', text: '~25%', icon: Plane, rate: 0.25, insuranceRate: 0.01 },
    ];

    const applyFreightProfile = (profileId: string) => {
        const profile = freightProfiles.find(p => p.id === profileId);
        if (profile) {
            updateInput('freightCost', inputs.invoiceValue * profile.rate);
            updateInput('insuranceCost', inputs.invoiceValue * profile.insuranceRate);
            updateInput('otherCharges', 0);

            // Analytics
            import('@/lib/analytics').then(({ trackEvent }) => {
                trackEvent('freight_profile_selected', { profile_id: profileId, mode: 'profiles' });
            });

            setTimeout(calculate, 0);
        }
    };

    return (
        <Card className="mb-6 border-neutral-200 dark:border-neutral-800">
            <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-neutral-500" />
                    Scenario Builder
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

                {/* 1. Incoterm Toggle */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-xs text-neutral-500 uppercase tracking-wider">Incoterm</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-neutral-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs text-xs">Determines who pays for freight & insurance. FOB = You pay; CIF = Supplier pays.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['FOB', 'CIF', 'EXW', 'DAP'].map((term) => (
                            <Button
                                key={term}
                                variant={inputs.incoterm === term ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    updateInput('incoterm', term);
                                    import('@/lib/analytics').then(({ trackEvent }) => {
                                        trackEvent('incoterm_toggled', { incoterm: term });
                                    });
                                    setTimeout(calculate, 0);
                                }}
                                className={cn("text-xs h-8", inputs.incoterm === term && "ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-100")}
                            >
                                {term}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* 2. Freight Controls */}
                <div>
                    <Label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Freight & Logistics</Label>

                    <Tabs defaultValue="profiles" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-8 mb-3">
                            <TabsTrigger value="profiles" className="text-xs">Estimates</TabsTrigger>
                            <TabsTrigger value="manual" className="text-xs">Manual Entry</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profiles" className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                {freightProfiles.map((p) => {
                                    return (
                                        <Button
                                            key={p.id}
                                            variant="outline"
                                            size="sm"
                                            className="justify-start gap-2 h-auto py-2 relative"
                                            onClick={() => applyFreightProfile(p.id)}
                                        >
                                            <p.icon className="h-4 w-4 text-neutral-500" />
                                            <div className="text-left">
                                                <span className="block text-xs font-semibold">{p.label}</span>
                                                <span className="block text-[10px] text-neutral-400">{p.text}</span>
                                            </div>
                                            {/* Visual feedback if matches current calcs roughly? Hard to track state without 'profile' field in store. 
                                                Skipping active state for now as spec says "editable after apply" 
                                            */}
                                        </Button>
                                    )
                                })}
                            </div>
                            <p className="text-[10px] text-neutral-400 text-center">
                                *Estimates based on typical % of invoice value.
                            </p>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-neutral-500">Freight</Label>
                                    <Input
                                        type="number"
                                        value={inputs.freightCost || ''}
                                        onChange={(e) => updateInput('freightCost', parseFloat(e.target.value))}
                                        className="h-8 text-xs"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-neutral-500">Insurance</Label>
                                    <Input
                                        type="number"
                                        value={inputs.insuranceCost || ''}
                                        onChange={(e) => updateInput('insuranceCost', parseFloat(e.target.value))}
                                        className="h-8 text-xs"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" className="w-full h-7 text-xs" onClick={() => setTimeout(calculate, 0)}>
                                Update Totals
                            </Button>
                        </TabsContent>
                    </Tabs>
                </div>

                <Separator />

                {/* 3. Value Presets */}
                <div>
                    <Label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Invoice Value</Label>
                    <div className="flex flex-wrap gap-2">
                        {presets.map((val) => (
                            <Button
                                key={val}
                                variant="outline"
                                size="sm"
                                onClick={() => applyPreset(val)}
                                className={cn("text-xs h-7", inputs.invoiceValue === val ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-400" : "")}
                            >
                                R {val.toLocaleString('en-ZA')}
                            </Button>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
