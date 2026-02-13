/**
 * InternalLinksGrid.tsx
 *
 * Renders contextual internal links grouped by relationship type.
 * SSR-rendered for crawlability. Uses LinkBlock component.
 */

import type { InterlinkingData } from "@/lib/seo/interlinking.service";
import { LinkBlock } from "./LinkBlock";
import { Globe, Package, Hash } from "lucide-react";

interface InternalLinksGridProps {
    data: InterlinkingData;
    originCountryName: string;
    productName: string;
}

export function InternalLinksGrid({
    data,
    originCountryName,
    productName,
}: InternalLinksGridProps) {
    const hasAnyLinks =
        data.sameProductOtherOrigins.length > 0 ||
        data.sameOriginOtherProducts.length > 0 ||
        data.relatedHsCodes.length > 0;

    if (!hasAnyLinks) return null;

    return (
        <section className="mt-16 mb-8" aria-labelledby="related-guides-heading">
            <div className="mb-6">
                <h2
                    id="related-guides-heading"
                    className="text-2xl font-bold tracking-tight text-slate-900"
                >
                    Related Import Cost Guides
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Explore related duty calculators and import cost guides.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LinkBlock
                    title={`${productName} from Other Countries`}
                    icon={<Globe className="h-4 w-4 text-sky-600" />}
                    links={data.sameProductOtherOrigins}
                    emptyText="No other origins available yet."
                />
                <LinkBlock
                    title={`More Imports from ${originCountryName}`}
                    icon={<Package className="h-4 w-4 text-sky-600" />}
                    links={data.sameOriginOtherProducts}
                    emptyText="No other products available yet."
                />
                <LinkBlock
                    title="Related Tariff Codes"
                    icon={<Hash className="h-4 w-4 text-sky-600" />}
                    links={data.relatedHsCodes}
                    emptyText="No related codes available yet."
                />
            </div>
        </section>
    );
}
