import { Info } from "lucide-react";

interface DisclaimerBannerProps {
    tariffVersion?: string;
    lastUpdated?: string;
}

export function DisclaimerBanner({ tariffVersion, lastUpdated }: DisclaimerBannerProps) {
    return (
        <div className="my-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <Info className="h-3.5 w-3.5" />
                </span>
                <div className="space-y-1 text-xs leading-relaxed text-slate-600">
                    <p>
                        <strong className="text-slate-800">Disclaimer:</strong> Figures shown are estimates for planning decisions.
                        Confirm final duties, taxes, and compliance requirements with{" "}
                        <a href="https://www.sars.gov.za" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-700 underline hover:text-sky-800">
                            SARS
                        </a>{" "}
                        and your licensed clearing agent.
                    </p>
                    <p>
                        FX at clearance and anti-dumping/provisional changes can alter final landed cost.
                    </p>
                    {(tariffVersion || lastUpdated) && (
                        <p className="text-slate-500">
                            {tariffVersion && <>Tariff: {tariffVersion}. </>}
                            {lastUpdated && <>Data updated: {lastUpdated}.</>}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
