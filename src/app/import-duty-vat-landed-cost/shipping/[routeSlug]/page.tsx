import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortComparison, getAllPortSlugs } from "@/lib/seo/portRouteData";
import { generatePortRiskBullets } from "@/lib/seo/riskBulletData";
import { RiskBullets } from "@/components/pseo/RiskBullets";
import { Ship, Clock, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://importcosts.co.za";

interface PageProps {
    params: Promise<{ routeSlug: string }>;
}

export async function generateStaticParams() {
    return getAllPortSlugs().map(slug => ({ routeSlug: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { routeSlug } = await params;
    const data = getPortComparison(routeSlug);
    if (!data) return { title: "Route Not Found" };

    return {
        title: `${data.title}: Port & Freight Comparison | ImportCosts`,
        description: data.description,
        alternates: {
            canonical: `${BASE_URL}/import-duty-vat-landed-cost/shipping/${routeSlug}`,
        },
        robots: "index, follow",
        openGraph: {
            title: `${data.title} | ImportCosts`,
            description: data.description,
            siteName: "ImportCosts",
            type: "website",
            locale: "en_ZA",
        },
    };
}

function formatUSD(amount: number): string {
    return `$${amount.toLocaleString("en-US")}`;
}

function formatZAR(amount: number): string {
    return `R${amount.toLocaleString("en-ZA")}`;
}

function CongestionBadge({ risk }: { risk: "low" | "medium" | "high" }) {
    const styles = {
        low: "bg-emerald-100 text-emerald-800",
        medium: "bg-amber-100 text-amber-800",
        high: "bg-red-100 text-red-800",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[risk]}`}>
            {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
        </span>
    );
}

export default async function PortRoutePage({ params }: PageProps) {
    const { routeSlug } = await params;
    const data = getPortComparison(routeSlug);
    if (!data) return notFound();

    const originPort = data.routes[0]?.originPort || "Origin";
    const riskBullets = generatePortRiskBullets(originPort, "South Africa");

    return (
        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5">
                    <li><Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link></li>
                    <li>/</li>
                    <li><Link href="/import-duty-vat-landed-cost/shipping" className="hover:text-neutral-900 transition-colors">Shipping Routes</Link></li>
                    <li>/</li>
                    <li className="text-neutral-900 font-medium">{data.title}</li>
                </ol>
            </nav>

            {/* H1 */}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                {data.title}: Port & Freight Comparison
            </h1>
            <p className="text-neutral-600 leading-relaxed max-w-2xl mb-10">
                {data.description}
            </p>

            {/* H2: Transit Time & Cost */}
            <section aria-labelledby="transit-heading" className="mb-12">
                <h2 id="transit-heading" className="text-xl font-bold text-neutral-900 mb-1">
                    Transit Time & Cost
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                    Comparison for a standard 20&apos; container (TEU).
                </p>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-neutral-200">
                                <th className="text-left py-3 px-3 font-semibold text-neutral-600">Route</th>
                                <th className="text-right py-3 px-3 font-semibold text-neutral-600">Sea (days)</th>
                                <th className="text-right py-3 px-3 font-semibold text-neutral-600">Air (days)</th>
                                <th className="text-right py-3 px-3 font-semibold text-neutral-600">Sea Cost/TEU</th>
                                <th className="text-right py-3 px-3 font-semibold text-neutral-600">Air Cost/kg</th>
                                <th className="text-right py-3 px-3 font-semibold text-neutral-600">Port Fees</th>
                                <th className="text-center py-3 px-3 font-semibold text-neutral-600">Congestion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.routes.map((route, i) => (
                                <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-3 px-3 font-medium text-neutral-900">
                                        {route.originPort} → {route.destPort}
                                    </td>
                                    <td className="py-3 px-3 text-right text-neutral-700">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                            {route.transitDaysSea}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right text-neutral-700">{route.transitDaysAir}</td>
                                    <td className="py-3 px-3 text-right font-semibold text-neutral-900">{formatUSD(route.costPerTeuSea)}</td>
                                    <td className="py-3 px-3 text-right text-neutral-700">{formatUSD(route.costPerKgAir)}</td>
                                    <td className="py-3 px-3 text-right text-neutral-700">{formatZAR(route.portFeesZar)}</td>
                                    <td className="py-3 px-3 text-center"><CongestionBadge risk={route.congestionRisk} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-4">
                    {data.routes.map((route, i) => (
                        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                                    <Ship className="h-4 w-4 text-blue-600" />
                                    {route.originPort} → {route.destPort}
                                </span>
                                <CongestionBadge risk={route.congestionRisk} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-neutral-500">Sea Transit</div>
                                <div className="text-right text-neutral-900">{route.transitDaysSea} days</div>
                                <div className="text-neutral-500">Sea Cost/TEU</div>
                                <div className="text-right font-semibold text-neutral-900">{formatUSD(route.costPerTeuSea)}</div>
                                <div className="text-neutral-500">Air Transit</div>
                                <div className="text-right text-neutral-900">{route.transitDaysAir} days</div>
                                <div className="text-neutral-500">Air Cost/kg</div>
                                <div className="text-right text-neutral-900">{formatUSD(route.costPerKgAir)}</div>
                                <div className="text-neutral-500">Port Fees</div>
                                <div className="text-right text-neutral-900">{formatZAR(route.portFeesZar)}</div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-3 leading-relaxed">{route.notes}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* H2: Port Fees & Delays */}
            <section aria-labelledby="port-fees-heading" className="mb-12">
                <h2 id="port-fees-heading" className="text-xl font-bold text-neutral-900 mb-1">
                    Port Fees & Delays
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                    Key operational considerations at each destination port.
                </p>
                <div className="space-y-4">
                    {data.routes.map((route, i) => (
                        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-50">
                                    <Ship className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900">{route.destPort}</h3>
                                    <p className="text-sm text-neutral-600 mt-1">{route.notes}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                        <span>Landing Fees: {formatZAR(route.portFeesZar)}</span>
                                        <span>•</span>
                                        <CongestionBadge risk={route.congestionRisk} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* H2: Risk Bullets */}
            <RiskBullets
                bullets={riskBullets}
                title="Shipping Risks to Watch"
                subtitle="Common factors that add cost or delay to your import shipment."
            />

            {/* Import Readiness Checklist */}
            <section aria-labelledby="checklist-heading" className="mt-12 mb-12">
                <h2 id="checklist-heading" className="text-xl font-bold text-neutral-900 mb-6">
                    Import Readiness Checklist
                </h2>
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <ul className="space-y-3">
                        {[
                            "Arrange local trucking from port to warehouse",
                            "Check SARS port schedules and peak-season surcharges",
                            "Confirm dry port X-ray and inspection rules",
                            "Obtain freight quotes from at least 3 forwarders",
                            "Verify demurrage-free storage period at destination port",
                            "Ensure customs broker is registered at destination port",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <div className="mt-0.5 rounded border border-neutral-200 bg-neutral-50 p-0.5 text-neutral-400">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-neutral-700">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-12 mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-center">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                    Run a Cost Comparison
                </h2>
                <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                    Use our calculator to see how these freight costs affect your total landed cost and margin.
                </p>
                <Link
                    href="/import-duty-vat-landed-cost/solar-panels/from/cn/to/south-africa"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Open Deal Calculator
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </main>
    );
}
