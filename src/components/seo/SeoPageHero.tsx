import React from "react";
import { Badge } from "@/components/ui/badge";

interface SeoPageHeroProps {
    clusterName: string;
    originName: string;
    destName: string;
    indexStatus: string;
}

export function SeoPageHero({
    clusterName,
    originName,
    destName,
    indexStatus
}: SeoPageHeroProps) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-neutral-900 flex flex-col items-center text-center px-4">
            <div className="space-y-4 max-w-3xl">
                {indexStatus !== "INDEX" && (
                    <Badge variant="destructive" className="mb-4">
                        Preview Mode (NoIndex)
                    </Badge>
                )}

                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Import Duty & Taxes for {clusterName} from {originName} to {destName}
                </h1>

                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Calculate the exact landed cost, including Customs Duty, VAT (15%), and freight estimates.
                    Updated for 2026 Tariff Schedules.
                </p>
            </div>
        </section>
    );
}
