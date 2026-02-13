"use client";

import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { GoldenScenario } from "@/data/golden-scenarios/solar-panels";
import { Plane, Ship, Package } from "lucide-react";

interface ScenarioSelectorProps {
    scenarios: GoldenScenario[];
}

export function ScenarioSelector({ scenarios }: ScenarioSelectorProps) {
    const { inputs, setInputs } = usePSEOCalculatorStore();

    const activeScenarioId = scenarios.find((s) => s.inputs.quantity === inputs.quantity && s.inputs.incoterm === inputs.incoterm)?.id;

    const handleSelect = (scenario: GoldenScenario) => {
        setInputs(scenario.inputs);
    };

    const getIcon = (id: string) => {
        if (id.includes("air")) return Plane;
        if (id.includes("lcl")) return Package;
        return Ship;
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Scenario presets</h3>
            <p className="mt-1 text-sm text-slate-600">Pick a baseline operating pattern and refine from there.</p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {scenarios.map((scenario) => {
                    const isActive = activeScenarioId === scenario.id;
                    const Icon = getIcon(scenario.id);

                    return (
                        <button
                            key={scenario.id}
                            onClick={() => handleSelect(scenario)}
                            className={`w-full rounded-xl border p-4 text-left transition-all ${isActive
                                ? "border-sky-500 bg-sky-50 ring-1 ring-sky-200"
                                : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40"
                                }`}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div className={`rounded-lg p-2 ${isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                {isActive ? (
                                    <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        Active
                                    </span>
                                ) : null}
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900">{scenario.label}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">{scenario.description}</p>

                            {scenario.highlightedRisks[0] ? (
                                <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                    Note: {scenario.highlightedRisks[0]}
                                </p>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
