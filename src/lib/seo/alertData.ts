/**
 * alertData.ts
 *
 * Static compliance alert configs for pSEO alert pages.
 * Each alert represents a regulatory change affecting importers.
 */

export interface ComplianceAlert {
    slug: string;
    title: string;
    year: number;
    effectiveDate: string;
    authority: string;
    description: string;
    affectedHsCodes: { hs6: string; description: string }[];
    beforeAfterRates: {
        label: string;
        before: string;
        after: string;
        impactZar: string;
    }[];
    riskBullets: {
        title: string;
        detail: string;
    }[];
    checklist: string[];
    relatedLinks: { label: string; href: string }[];
}

export const COMPLIANCE_ALERTS: ComplianceAlert[] = [
    {
        slug: "anti-dumping-steel-coils-2025",
        title: "New Anti-Dumping Duty on Chinese Steel Coils",
        year: 2025,
        effectiveDate: "2025-06-15",
        authority: "ITAC (International Trade Administration Commission)",
        description: "South Africa's ITAC has imposed a 15% anti-dumping duty on specific flat-rolled steel products and coils originating from China (effective June 2025). This affects products classified under HS heading 7306 and related subheadings. The measure follows a formal investigation into injurious dumping that harmed local steel producers.",
        affectedHsCodes: [
            { hs6: "730630", description: "Tubes, pipes and hollow profiles of iron or steel, welded" },
            { hs6: "730640", description: "Other tubes and pipes, welded, circular cross-section, stainless steel" },
            { hs6: "721049", description: "Flat-rolled products of iron, plated or coated with zinc" },
            { hs6: "721099", description: "Other flat-rolled products, width ≥ 600mm" },
        ],
        beforeAfterRates: [
            { label: "HS 730630 (Welded steel tubes)", before: "10% ad valorem", after: "10% + 15% AD = 25%", impactZar: "+R1,500 per R10,000 CIF" },
            { label: "HS 721049 (Zinc-coated coils)", before: "10% ad valorem", after: "10% + 15% AD = 25%", impactZar: "+R1,500 per R10,000 CIF" },
            { label: "HS 721099 (Other flat-rolled)", before: "10% ad valorem", after: "10% + 15% AD = 25%", impactZar: "+R1,500 per R10,000 CIF" },
        ],
        riskBullets: [
            {
                title: "Immediate cost impact",
                detail: "Any coil/tube shipment declared under affected HS codes will incur an additional 15% ad valorem as per ITAC Notice No. 123/2025.",
            },
            {
                title: "Non-compliance penalties",
                detail: "Under-declaring or misclassifying to avoid the AD duty can result in fines up to R10,000/kg and seizure of goods.",
            },
            {
                title: "Alternative sourcing",
                detail: "Vietnam, India, and Turkey are not subject to this AD duty. Consider diversifying supply to reduce cost impact.",
            },
            {
                title: "Retrospective application",
                detail: "Goods shipped before the effective date but cleared after may still be subject to the new duty. Check your BL dates.",
            },
        ],
        checklist: [
            "Attach ITAC certificate to your bill of entry",
            "List anti-dumping docket number on customs declaration",
            "Verify HS classification with a licensed tariff consultant",
            "Retain supplier invoices showing country of manufacture (not just shipment)",
            "Consider applying for a rebate under Schedule 4 if goods are for further manufacture",
        ],
        relatedLinks: [
            { label: "ITAC Official Notices", href: "https://www.itac.org.za" },
            { label: "SARS Tariff Amendments", href: "https://www.sars.gov.za/customs-and-excise/tariff-management/" },
        ],
    },
    {
        slug: "nrcs-electrical-appliances-2025",
        title: "Updated NRCS Requirements for Electrical Appliances",
        year: 2025,
        effectiveDate: "2025-03-01",
        authority: "NRCS (National Regulator for Compulsory Specifications)",
        description: "The NRCS has updated compulsory specification VC 8055 for electrical and electronic apparatus, effective March 2025. All imports of products falling under this specification now require an updated Letter of Authority (LoA) with the new compliance mark. Older LoAs will not be accepted at the port of entry.",
        affectedHsCodes: [
            { hs6: "851713", description: "Smartphones and cellular phones" },
            { hs6: "847130", description: "Portable digital automatic data processing machines (laptops)" },
            { hs6: "841510", description: "Air conditioning machines" },
            { hs6: "850760", description: "Lithium-ion accumulators (batteries)" },
        ],
        beforeAfterRates: [
            { label: "All affected HS codes", before: "Existing LoA accepted", after: "New VC 8055 LoA required", impactZar: "R5,000-R15,000 LoA renewal cost" },
            { label: "Goods without new LoA", before: "Cleared with old LoA", after: "Held at port pending compliance", impactZar: "Demurrage: R2,000-R5,000/day" },
        ],
        riskBullets: [
            {
                title: "Port detention risk",
                detail: "Goods arriving without the updated LoA will be detained at the port. Storage costs accumulate at R2,000-R5,000 per day.",
            },
            {
                title: "LoA renewal timeline",
                detail: "NRCS LoA renewals currently take 4-8 weeks. Plan ahead to avoid shipment delays.",
            },
            {
                title: "Testing laboratory bottleneck",
                detail: "SABS and accredited labs are experiencing high volumes. Book testing slots at least 6 weeks in advance.",
            },
        ],
        checklist: [
            "Apply for updated VC 8055 Letter of Authority before shipping",
            "Ensure product samples have been tested by an accredited lab",
            "Attach new LoA number to Bill of Entry",
            "Verify that your supplier's products meet the updated safety markings",
            "Keep copies of test reports for 5 years as per NRCS requirements",
        ],
        relatedLinks: [
            { label: "NRCS Official Website", href: "https://www.nrcs.org.za" },
            { label: "VC 8055 Specification", href: "https://www.nrcs.org.za/electrical-electronic-apparatus" },
        ],
    },
];

export function getAlert(slug: string): ComplianceAlert | undefined {
    return COMPLIANCE_ALERTS.find(a => a.slug === slug);
}

export function getAllAlertSlugs(): string[] {
    return COMPLIANCE_ALERTS.map(a => a.slug);
}
