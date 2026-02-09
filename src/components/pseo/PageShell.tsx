import { RouteContext } from "@/types/pseo";
import Head from "next/head";
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
    routeContext,
    className,
}: PageShellProps) {
    // Indexability Gating Logic (Strict Mode)
    // We only index pages that are "decision-ready"
    const isIndexable =
        // 1. Context must be prefilled
        routeContext.originIso && routeContext.hs6 &&
        // 2. Must have minimal content blocks (heuristic)
        // In a real implementation, we'd check for specific data availability server-side
        // For now, we assume if we have valid HS and Origin, we can generate the decision blocks
        true;

    const robotsMeta = isIndexable
        ? "index, follow"
        : "noindex, follow";

    return (
        <div className={cn("min-h-screen bg-neutral-50 dark:bg-neutral-950", className)}>
            {/* 
          Note: In Next.js App Router, Metadata is usually handled in proper generatesMetadata.
          However, for component-level control or if used in Pages router transition, we might keep this structure.
          For App Router, this component serves mainly as a Layout wrapper, and the metadata should be passed up.
          Assuming this is used inside a page.tsx that handles Metadata export.
       */}

            <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
                {children}
            </main>
        </div>
    );
}
