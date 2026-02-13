/**
 * RiskBullets.tsx
 *
 * SSR-rendered contextual risk bullet list for pSEO pages.
 * Each bullet includes an icon, title, and one-line detail.
 */

import type { RiskBullet } from "@/lib/seo/riskBulletData";
import { AlertTriangle, Ship, DollarSign, Shield, Scale, HandshakeIcon } from "lucide-react";

interface RiskBulletsProps {
    bullets: RiskBullet[];
    title?: string;
    subtitle?: string;
}

const ICONS: Record<string, React.ReactNode> = {
    classification: <Scale className="h-5 w-5 text-sky-600 flex-shrink-0" />,
    freight: <Ship className="h-5 w-5 text-sky-600 flex-shrink-0" />,
    currency: <DollarSign className="h-5 w-5 text-sky-600 flex-shrink-0" />,
    compliance: <Shield className="h-5 w-5 text-sky-600 flex-shrink-0" />,
    dumping: <AlertTriangle className="h-5 w-5 text-sky-600 flex-shrink-0" />,
    fta: <HandshakeIcon className="h-5 w-5 text-sky-600 flex-shrink-0" />,
};

export function RiskBullets({
    bullets,
    title = "Top Risks to Monitor",
    subtitle = "Key factors that could impact your import profitability.",
}: RiskBulletsProps) {
    if (bullets.length === 0) return null;

    return (
        <section className="mt-12 mb-8" aria-labelledby="risk-bullets-heading">
            <h2
                id="risk-bullets-heading"
                className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
            >
                {title}
            </h2>
            <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-600">
                {subtitle}
            </p>

            <div className="space-y-4">
                {bullets.map((bullet, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="mt-0.5">
                            {ICONS[bullet.icon] || <AlertTriangle className="h-5 w-5 text-slate-400 flex-shrink-0" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                {bullet.title}
                            </h3>
                            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                                {bullet.detail}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
