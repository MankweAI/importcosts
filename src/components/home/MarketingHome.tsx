import Link from "next/link";

export function MarketingHome() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">
                        Import Duty, VAT & Landed Cost Calculator
                    </h1>
                    <p className="text-xl text-slate-600 mb-8">
                        Know exactly what it costs to import into South Africa — duties, VAT,
                        landed cost per unit, and compliance requirements — in under 30 seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/calculator"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Calculate Now →
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant Results</h3>
                        <p className="text-slate-600">
                            Get duty, VAT, and landed cost estimates in seconds — no PDF hunting required.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Compliance Ready</h3>
                        <p className="text-slate-600">
                            Document checklists, trade preference guidance, and risk flags included.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Auditable</h3>
                        <p className="text-slate-600">
                            Every calculation shows exactly how it was computed — formulas, rates, and versions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 mt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600">
                            © {new Date().getFullYear()} ImportCosts. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-slate-600 hover:text-slate-900">
                                Privacy
                            </Link>
                            <Link href="/terms" className="text-slate-600 hover:text-slate-900">
                                Terms
                            </Link>
                            <Link href="/contact" className="text-slate-600 hover:text-slate-900">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
