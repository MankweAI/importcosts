/**
 * VATFormulaExplainer.tsx
 *
 * GAP-06: Shows the SARS ATV (Added Tax Value) formula with actual numbers.
 * Explains WHY there's a 10% uplift on customs value before VAT is applied.
 * SSR-rendered — pure server component, no "use client".
 */

interface VATFormulaExplainerProps {
    customsValue: number;
    dutyAmount: number;
    vatAmount: number;
}

function fmtR(n: number): string {
    return `R${Math.round(n).toLocaleString("en-ZA")}`;
}

export function VATFormulaExplainer({
    customsValue,
    dutyAmount,
    vatAmount,
}: VATFormulaExplainerProps) {
    const uplift10pct = customsValue * 0.10;
    const atv = customsValue + uplift10pct + dutyAmount;
    const computedVat = atv * 0.15;

    return (
        <section className="mt-10 mb-8" aria-labelledby="vat-formula-heading">
            <h2
                id="vat-formula-heading"
                className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl"
            >
                How VAT Is Calculated
            </h2>
            <p className="mt-1 text-sm text-neutral-500 max-w-2xl mb-6">
                SARS uses the &ldquo;Added Tax Value&rdquo; (ATV) method. The customs value is uplifted by 10% before
                duties are added, and then the 15% VAT rate is applied to the total.
            </p>

            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                {/* Formula Steps */}
                <div className="divide-y divide-neutral-100">
                    {/* Step 1 */}
                    <div className="px-5 py-3">
                        <div className="flex justify-between items-center text-sm">
                            <div>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2">1</span>
                                <span className="text-neutral-600">Customs Value</span>
                            </div>
                            <span className="font-mono font-medium text-neutral-900">{fmtR(customsValue)}</span>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="px-5 py-3 bg-amber-50/50">
                        <div className="flex justify-between items-center text-sm">
                            <div>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mr-2">2</span>
                                <span className="text-neutral-600">+ 10% Uplift <span className="text-xs text-neutral-400">(SARS mandatory)</span></span>
                            </div>
                            <span className="font-mono font-medium text-amber-700">+ {fmtR(uplift10pct)}</span>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="px-5 py-3">
                        <div className="flex justify-between items-center text-sm">
                            <div>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2">3</span>
                                <span className="text-neutral-600">+ Non-Rebated Duties</span>
                            </div>
                            <span className="font-mono font-medium text-neutral-900">+ {fmtR(dutyAmount)}</span>
                        </div>
                    </div>

                    {/* ATV Subtotal */}
                    <div className="px-5 py-3 bg-neutral-50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-neutral-900 ml-8">
                                = ATV (Added Tax Value)
                            </span>
                            <span className="font-mono font-bold text-neutral-900">{fmtR(atv)}</span>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">4</span>
                                <span className="font-semibold text-neutral-900">VAT = ATV × 15%</span>
                            </div>
                            <span className="font-mono text-lg font-bold text-blue-700">{fmtR(computedVat)}</span>
                        </div>
                    </div>
                </div>

                {/* Explanation Note */}
                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        <strong>Why the 10% uplift?</strong> SARS adds 10% to the customs value to approximate the cost of
                        bringing goods to the point of sale in South Africa. This is a fixed uplift applied to all imports regardless
                        of actual costs. See <a href="https://www.sars.gov.za" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">SARS Customs &amp; Excise</a> for official guidance.
                    </p>
                </div>
            </div>
        </section>
    );
}
