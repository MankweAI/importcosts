/**
 * DisclaimerBanner.tsx
 *
 * GAP-08: Legal disclaimer footer required on every pSEO page per blueprint.
 * SSR-rendered — pure server component.
 */

interface DisclaimerBannerProps {
    tariffVersion?: string;
    lastUpdated?: string;
}

export function DisclaimerBanner({ tariffVersion, lastUpdated }: DisclaimerBannerProps) {
    return (
        <div className="mt-12 mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4">
            <div className="flex items-start gap-3">
                <span className="text-neutral-400 text-lg mt-0.5">ℹ️</span>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1">
                    <p>
                        <strong className="text-neutral-600">Disclaimer:</strong> These figures are estimates for informational purposes only.
                        Always confirm actual duties, taxes, and regulatory requirements with{" "}
                        <a href="https://www.sars.gov.za" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                            SARS
                        </a>{" "}
                        and your licensed clearing agent before making import decisions.
                    </p>
                    <p>
                        Exchange rates may differ at the time of customs clearance. Anti-dumping and provisional duty changes
                        may not be reflected immediately.
                    </p>
                    {(tariffVersion || lastUpdated) && (
                        <p className="text-neutral-400">
                            {tariffVersion && <>Tariff: {tariffVersion}. </>}
                            {lastUpdated && <>Data last updated: {lastUpdated}.</>}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
