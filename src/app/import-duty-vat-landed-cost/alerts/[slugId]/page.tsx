import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlert, getAllAlertSlugs } from "@/lib/seo/alertData";
import { AlertTriangle, ArrowRight, ExternalLink, Shield, Calendar } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

interface PageProps {
    params: Promise<{ slugId: string }>;
}

export async function generateStaticParams() {
    return getAllAlertSlugs().map(slug => ({ slugId: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slugId } = await params;
    const alert = getAlert(slugId);
    if (!alert) return { title: "Alert Not Found" };

    return {
        title: `Alert: ${alert.title} (${alert.year}) | ImportCosts`,
        description: alert.description.substring(0, 155) + "...",
        alternates: {
            canonical: `${BASE_URL}/import-duty-vat-landed-cost/alerts/${slugId}`,
        },
        robots: "index, follow",
        openGraph: {
            title: `${alert.title} | ImportCosts`,
            description: alert.description.substring(0, 155),
            siteName: "ImportCosts",
            type: "article",
            locale: "en_ZA",
        },
    };
}

export default async function ComplianceAlertPage({ params }: PageProps) {
    const { slugId } = await params;
    const alert = getAlert(slugId);
    if (!alert) return notFound();

    return (
        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5">
                    <li><Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link></li>
                    <li>/</li>
                    <li><Link href="/import-duty-vat-landed-cost/alerts" className="hover:text-neutral-900 transition-colors">Compliance Alerts</Link></li>
                    <li>/</li>
                    <li className="text-neutral-900 font-medium">{alert.title}</li>
                </ol>
            </nav>

            {/* Alert Banner */}
            <div className="mb-8 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                        <AlertTriangle className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-amber-700 font-medium mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Effective: {new Date(alert.effectiveDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-bold uppercase">
                                {alert.authority}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">
                            Alert: {alert.title} ({alert.year})
                        </h1>
                    </div>
                </div>
            </div>

            {/* H2: What Changed? */}
            <section aria-labelledby="what-changed" className="mb-10">
                <h2 id="what-changed" className="text-xl font-bold text-neutral-900 mb-3">
                    What Changed?
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                    {alert.description}
                </p>
            </section>

            {/* H2: Affected Products */}
            <section aria-labelledby="affected-products" className="mb-10">
                <h2 id="affected-products" className="text-xl font-bold text-neutral-900 mb-4">
                    Affected Products
                </h2>
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-neutral-200 bg-neutral-50">
                                <th className="text-left py-3 px-4 font-semibold text-neutral-600">HS Code</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-600">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alert.affectedHsCodes.map((hs, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                                        <Link
                                            href={`/import-duty-vat-landed-cost/hs/${hs.hs6}/from/cn/to/south-africa`}
                                            className="hover:underline"
                                        >
                                            {hs.hs6}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-neutral-700">{hs.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* H2: Cost Impact Example */}
            <section aria-labelledby="cost-impact" className="mb-10">
                <h2 id="cost-impact" className="text-xl font-bold text-neutral-900 mb-4">
                    Cost Impact Example
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                    Before vs. after comparison based on a R10,000 CIF import value.
                </p>
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-neutral-200 bg-neutral-50">
                                <th className="text-left py-3 px-4 font-semibold text-neutral-600">Product</th>
                                <th className="text-center py-3 px-4 font-semibold text-neutral-600">Before</th>
                                <th className="text-center py-3 px-4 font-semibold text-neutral-600">After</th>
                                <th className="text-right py-3 px-4 font-semibold text-red-600">Impact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alert.beforeAfterRates.map((row, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-3 px-4 font-medium text-neutral-900">{row.label}</td>
                                    <td className="py-3 px-4 text-center text-neutral-700">{row.before}</td>
                                    <td className="py-3 px-4 text-center font-semibold text-red-700">{row.after}</td>
                                    <td className="py-3 px-4 text-right font-semibold text-red-700">{row.impactZar}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* H2: Risk Bullets */}
            <section aria-labelledby="alert-risks" className="mb-10">
                <h2 id="alert-risks" className="text-xl font-bold text-neutral-900 mb-4">
                    Key Risks
                </h2>
                <div className="space-y-4">
                    {alert.riskBullets.map((bullet, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm"
                        >
                            <div className="mt-0.5">
                                <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">{bullet.title}</h3>
                                <p className="text-sm text-neutral-600 mt-0.5 leading-relaxed">{bullet.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* H2: Compliance Checklist */}
            <section aria-labelledby="alert-checklist" className="mb-10">
                <h2 id="alert-checklist" className="text-xl font-bold text-neutral-900 mb-4">
                    Compliance Checklist
                </h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <ul className="space-y-3">
                        {alert.checklist.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <div className="mt-0.5 rounded border border-red-200 bg-red-50 p-0.5 text-red-500">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-neutral-700">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Related Links */}
            {alert.relatedLinks.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                        Official Sources
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {alert.relatedLinks.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {link.label}
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="mt-12 mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 text-center">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                    Calculate Your New Landed Cost
                </h2>
                <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                    Use our calculator to see how this regulatory change affects your specific import scenario.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/import-duty-vat-landed-cost/solar-panels/from/cn/to/south-africa"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors shadow-sm"
                    >
                        Open Deal Calculator
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/import-duty-vat-landed-cost/alerts"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-semibold text-sm hover:border-neutral-400 transition-colors"
                    >
                        Check Another Alert
                    </Link>
                </div>
            </section>
        </main>
    );
}
