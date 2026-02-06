import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface SeoFaqBlockProps {
    clusterName: string;
    originName: string;
    destName: string;
    dutyRateText: string;
}

export function SeoFaqBlock({
    clusterName,
    dutyRateText,
    originName,
    destName
}: SeoFaqBlockProps) {
    return (
        <section className="w-full max-w-3xl mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What is the import duty for {clusterName}?</AccordionTrigger>
                    <AccordionContent>
                        The standard import duty for {clusterName} when importing from {originName} to {destName} is typically <strong>{dutyRateText}</strong>.
                        However, specific rates may apply depending on the exact HS code and material composition.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionTrigger>Is VAT charged on {clusterName} imports?</AccordionTrigger>
                    <AccordionContent>
                        Yes, VAT is charged at 15% on the Added Tax Value (ATV), which is calculated as
                        <em> (Customs Value x 1.1) + Customs Duty</em>.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger>Do I need an import permit?</AccordionTrigger>
                    <AccordionContent>
                        For most general goods like {clusterName}, an import permit is not required if the value is under R50,000 and you have an Importers Code.
                        Check specific regulations for second-hand goods or large commercial quantities.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}
