import Link from "next/link";
import { Anchor, Calculator } from "lucide-react";

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const mvpRoute = "/import-duty-vat-landed-cost/solar-panels/from/china/to/south-africa";

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900 text-white md:flex">
                <div className="flex items-center gap-3 border-b border-slate-800 p-6">
                    <div className="rounded-lg bg-sky-500 p-2">
                        <Anchor className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight">ImportCosts</span>
                        <p className="text-[11px] text-slate-400">MVP Route</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <Link
                        href={mvpRoute}
                        className="flex items-center gap-3 rounded-lg bg-sky-600/20 px-3 py-2.5 text-sm font-medium text-sky-400 transition-colors"
                    >
                        <Calculator className="h-5 w-5" />
                        Profitability Modeller
                    </Link>
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <div className="rounded-lg bg-slate-800 p-3">
                        <p className="mb-1 text-xs text-slate-400">Primary lane</p>
                        <p className="text-sm font-semibold text-white">China to South Africa</p>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="z-20 border-b border-slate-800 bg-slate-900 p-4 text-white md:hidden">
                    <Link href={mvpRoute} className="flex items-center gap-2">
                        <span className="rounded-md bg-sky-500 p-1.5">
                            <Anchor className="h-4 w-4 text-white" />
                        </span>
                        <span className="font-bold">ImportCosts</span>
                    </Link>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50 overscroll-none">
                    <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
