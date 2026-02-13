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
                    className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
                >
                    Frequently Asked Questions
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Common questions about importing {productName} into South Africa — duties, VAT, documentation, and compliance.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, i) => (
                    <AccordionItem
                        key={i}
                        value={`faq-${i}`}
                        className="rounded-lg border border-slate-200 bg-white px-5 shadow-sm transition-shadow data-[state=open]:shadow-md"
                    >
                        <AccordionTrigger className="py-4 text-left text-sm font-semibold text-slate-800 hover:no-underline [&[data-state=open]]:text-sky-700">
                            <h3 className="text-[15px] leading-snug font-semibold pr-4">{faq.question}</h3>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-0 text-sm leading-relaxed text-slate-600">
                            <p>{faq.answer}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
