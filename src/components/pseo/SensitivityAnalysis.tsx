import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface SensitivityAnalysisProps {
    landedCost: number;
    customsValue: number;
    dutyRate: number;
    dutyAmount: number;
    exchangeRate: number;
    invoiceValue: number;
}

function fmtR(value: number): string {
    return `R${Math.round(Math.abs(value)).toLocaleString("en-ZA")}`;
}

function fmtSigned(value: number): string {
    return value >= 0 ? `+${fmtR(value)}` : `-${fmtR(value)}`;
}

export function SensitivityAnalysis({
    landedCost,
    customsValue,
    dutyRate,
    dutyAmount,
    exchangeRate,
    invoiceValue,
}: SensitivityAnalysisProps) {
    const fxUp10 = invoiceValue * 0.1;
    const fxDown10 = invoiceValue * 0.1;

    const dutyIncrease5pp = customsValue * 0.05;
    const vatOnDutyIncrease = dutyIncrease5pp * 0.15;
    const totalDutyImpact = dutyIncrease5pp + vatOnDutyIncrease;

    const worstCase = fxUp10 + totalDutyImpact;
    const worstCasePct = ((worstCase / landedCost) * 100).toFixed(1);

    const scenarios = [
        {
            title: "ZAR weakens 10%",
            subtitle: `USD/ZAR ${exchangeRate.toFixed(2)} -> ${(exchangeRate * 1.1).toFixed(2)}`,
            impact: fxUp10,
            detail: "Invoice value in ZAR increases, which lifts duty and VAT base.",
            up: true,
        },
        {
            title: "ZAR strengthens 10%",
            subtitle: `USD/ZAR ${exchangeRate.toFixed(2)} -> ${(exchangeRate * 0.9).toFixed(2)}`,
            impact: -fxDown10,
            detail: "Invoice value in ZAR decreases, reducing landed cost pressure.",
            up: false,
        },
        {
            title: "Duty rate +5pp",
            subtitle: `${dutyRate.toFixed(0)}% -> ${(dutyRate + 5).toFixed(0)}% duty`,
            impact: totalDutyImpact,
            detail: `Incremental duty ${fmtR(dutyIncrease5pp)} + VAT impact ${fmtR(vatOnDutyIncrease)}.`,
            up: true,
        },
    ];

    return (
        <section className="my-8" aria-labelledby="sensitivity-heading">
            <div className="mb-4">
                <h2 id="sensitivity-heading" className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    Sensitivity analysis
                </h2>
                <p className="mt-1 text-sm text-slate-600">Stress test key assumptions before committing supplier and freight terms.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {scenarios.map((scenario) => (
                    <article key={scenario.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">{scenario.title}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${scenario.up ? "bg-slate-900 text-white" : "bg-sky-100 text-sky-700"}`}>
                                {scenario.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                Impact
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">{scenario.subtitle}</p>
                        <p className={`mt-3 text-2xl font-bold ${scenario.up ? "text-slate-900" : "text-sky-700"}`}>{fmtSigned(scenario.impact)}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{scenario.detail}</p>
                    </article>
                ))}
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-sky-700" />
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        Worst-case stack: {fmtSigned(worstCase)} ({worstCasePct}%)
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        If FX weakens 10% and duty rises 5 percentage points, landed cost could move from {fmtR(landedCost)} to {fmtR(landedCost + worstCase)}.
                        Current duty estimate in this run is {fmtR(dutyAmount)}.
                    </p>
                </div>
            </div>
        </section>
    );
}
