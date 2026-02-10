/**
 * FAQSection.tsx
 *
 * SSR-rendered FAQ accordion for pSEO pages.
 * Uses Radix Accordion for accessible expand/collapse.
 * All content is in static HTML for crawlability.
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQItem } from "@/lib/seo/faqData";

interface FAQSectionProps {
    faqs: FAQItem[];
    productName: string;
}

export function FAQSection({ faqs, productName }: FAQSectionProps) {
    if (faqs.length === 0) return null;

    return (
        <section className="mt-16 mb-8" aria-labelledby="faq-heading">
            <div className="mb-8">
                <h2
                    id="faq-heading"
                    className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl"
                >
                    Frequently Asked Questions
                </h2>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
                    Common questions about importing {productName} into South Africa — duties, VAT, documentation, and compliance.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, i) => (
                    <AccordionItem
                        key={i}
                        value={`faq-${i}`}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 shadow-sm data-[state=open]:shadow-md transition-shadow"
                    >
                        <AccordionTrigger className="py-4 text-left text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:no-underline [&[data-state=open]]:text-blue-700 dark:[&[data-state=open]]:text-blue-400">
                            <h3 className="text-[15px] leading-snug font-semibold pr-4">{faq.question}</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-0 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <p>{faq.answer}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
