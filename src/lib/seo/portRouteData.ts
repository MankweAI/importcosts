/**
 * portRouteData.ts
 *
 * Static port/route comparison data for pSEO shipping pages.
 * Based on publicly available shipping rate benchmarks.
 */

export interface PortRoute {
    originPort: string;
    originCountry: string;
    destPort: string;
    transitDaysSea: number;
    transitDaysAir: number;
    costPerTeuSea: number;      // USD
    costPerKgAir: number;       // USD
    portFeesZar: number;        // landing fees at SA port
    congestionRisk: "low" | "medium" | "high";
    notes: string;
}

export interface PortComparison {
    slug: string;
    title: string;
    description: string;
    routes: PortRoute[];
}

export const PORT_COMPARISONS: PortComparison[] = [
    {
        slug: "shanghai-to-south-africa",
        title: "Shipping from Shanghai to South Africa",
        description: "Compare transit options from Shanghai to Durban and Cape Town. Analyze cost, time, and risk for a standard 20' container.",
        routes: [
            {
                originPort: "Shanghai", originCountry: "China",
                destPort: "Durban",
                transitDaysSea: 28, transitDaysAir: 3,
                costPerTeuSea: 2800, costPerKgAir: 4.50,
                portFeesZar: 8500, congestionRisk: "high",
                notes: "Durban is SA's busiest port. Expect 2-5 day delays during peak season (Jan-Mar, Oct-Dec).",
            },
            {
                originPort: "Shanghai", originCountry: "China",
                destPort: "Cape Town",
                transitDaysSea: 24, transitDaysAir: 3,
                costPerTeuSea: 3200, costPerKgAir: 4.80,
                portFeesZar: 7200, congestionRisk: "medium",
                notes: "Cape Town is 4 days faster but ~$400/TEU more expensive. Better for Western Cape distribution.",
            },
        ],
    },
    {
        slug: "shenzhen-to-south-africa",
        title: "Shipping from Shenzhen to South Africa",
        description: "Shenzhen handles most electronics and consumer goods exports. Compare Durban vs Cape Town landing options.",
        routes: [
            {
                originPort: "Shenzhen", originCountry: "China",
                destPort: "Durban",
                transitDaysSea: 26, transitDaysAir: 3,
                costPerTeuSea: 2650, costPerKgAir: 4.20,
                portFeesZar: 8500, congestionRisk: "high",
                notes: "Direct sailings available. Shenzhen offers slightly lower rates than Shanghai for electronics.",
            },
            {
                originPort: "Shenzhen", originCountry: "China",
                destPort: "Cape Town",
                transitDaysSea: 22, transitDaysAir: 3,
                costPerTeuSea: 3000, costPerKgAir: 4.50,
                portFeesZar: 7200, congestionRisk: "medium",
                notes: "Fewer direct sailings; some routes transship via Singapore or Colombo.",
            },
        ],
    },
    {
        slug: "hamburg-to-south-africa",
        title: "Shipping from Hamburg to South Africa",
        description: "Germany is SA's largest European trade partner. Compare routes from Hamburg to Durban and Cape Town.",
        routes: [
            {
                originPort: "Hamburg", originCountry: "Germany",
                destPort: "Durban",
                transitDaysSea: 22, transitDaysAir: 2,
                costPerTeuSea: 2200, costPerKgAir: 3.80,
                portFeesZar: 8500, congestionRisk: "high",
                notes: "SADC-EU EPA may reduce duties. Direct services available via MSC and Maersk.",
            },
            {
                originPort: "Hamburg", originCountry: "Germany",
                destPort: "Cape Town",
                transitDaysSea: 18, transitDaysAir: 2,
                costPerTeuSea: 2400, costPerKgAir: 4.00,
                portFeesZar: 7200, congestionRisk: "low",
                notes: "Fastest European route to SA. Good for time-sensitive automotive and machinery imports.",
            },
        ],
    },
    {
        slug: "mumbai-to-south-africa",
        title: "Shipping from Mumbai to South Africa",
        description: "India is a growing source for textiles, pharmaceuticals, and machinery. Compare Mumbai to Durban and Cape Town.",
        routes: [
            {
                originPort: "Mumbai", originCountry: "India",
                destPort: "Durban",
                transitDaysSea: 14, transitDaysAir: 2,
                costPerTeuSea: 1800, costPerKgAir: 3.50,
                portFeesZar: 8500, congestionRisk: "high",
                notes: "Shortest major route to SA. SACU-India PTA may offer reduced duties on select goods.",
            },
            {
                originPort: "Mumbai", originCountry: "India",
                destPort: "Cape Town",
                transitDaysSea: 16, transitDaysAir: 2,
                costPerTeuSea: 2100, costPerKgAir: 3.80,
                portFeesZar: 7200, congestionRisk: "low",
                notes: "Less congested alternative. Good for Western Cape distribution.",
            },
        ],
    },
];

export function getPortComparison(slug: string): PortComparison | undefined {
    return PORT_COMPARISONS.find(p => p.slug === slug);
}

export function getAllPortSlugs(): string[] {
    return PORT_COMPARISONS.map(p => p.slug);
}
