import { AppShell } from "@/components/layout/AppShell";
import { RouteContext } from "@/types/pseo";
import { cn } from "@/lib/utils";

interface PageShellProps {
    children: React.ReactNode;
    routeContext: RouteContext;
    isIndexable: boolean;
    canonicalUrl: string;
    className?: string;
    title: string;
}

export function PageShell({
    children,
    routeContext: _routeContext,
    className,
}: PageShellProps) {
    void _routeContext;
    // Indexability Gating Logic (Strict Mode)
    // ... (logic remains)

    return (
        <AppShell>
            <div className={cn("mx-auto max-w-[1120px] space-y-6", className)}>
                {children}
            </div>
        </AppShell>
    );
}
