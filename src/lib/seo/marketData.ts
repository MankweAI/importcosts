/**
 * marketData.ts
 *
 * Provides rough retail price benchmarks for product clusters.
 * Used to give importers a "sanity check" on their landed cost
 * vs. what these items sell for in South Africa.
 */

export interface MarketBenchmark {
    clusterSlug: string;
    productName: string;
    retailLow: number;      // Aggressive online stores / entry level
    retailAverage: number;  // Standard retail / mid-range
    retailHigh: number;     // Premium / brand names / high-end
    currency: "ZAR";
}

const MARKET_DATA: Record<string, MarketBenchmark> = {
    "solar-panels": {
        clusterSlug: "solar-panels",
        productName: "Solar Panel (550W Tier 1)",
        retailLow: 2200,
        retailAverage: 2800,
        retailHigh: 3500,
        currency: "ZAR",
    },
    "inverters": {
        clusterSlug: "inverters",
        productName: "Hybrid Inverter (5kW)",
        retailLow: 12000,
        retailAverage: 16500,
        retailHigh: 22000,
        currency: "ZAR",
    },
    "lithium-ion-batteries": {
        clusterSlug: "lithium-ion-batteries",
        productName: "LiFePO4 Battery (5kWh)",
        retailLow: 21000,
        retailAverage: 26000,
        retailHigh: 35000,
        currency: "ZAR",
    },
    "smartphones": {
        clusterSlug: "smartphones",
        productName: "Android Smartphone (Mid-range)",
        retailLow: 3500,
        retailAverage: 6000,
        retailHigh: 12000,
        currency: "ZAR",
    },
    "laptops": {
        clusterSlug: "laptops",
        productName: "Business Laptop (i5/8GB)",
        retailLow: 8000,
        retailAverage: 12000,
        retailHigh: 18000,
        currency: "ZAR",
    },
    "led-lighting": {
        clusterSlug: "led-lighting",
        productName: "LED Floodlight (50W)",
        retailLow: 150,
        retailAverage: 250,
        retailHigh: 450,
        currency: "ZAR",
    },
    "t-shirts": {
        clusterSlug: "t-shirts",
        productName: "Cotton T-Shirt (Plain)",
        retailLow: 60,
        retailAverage: 120,
        retailHigh: 250,
        currency: "ZAR",
    },
    "shoes": {
        clusterSlug: "shoes",
        productName: "Casual Sneaker",
        retailLow: 400,
        retailAverage: 900,
        retailHigh: 2000,
        currency: "ZAR",
    },
};

/**
 * Get retail price benchmarks for a product cluster.
 * If not found, returns estimative defaults based on unit cost multiplier.
 */
export function getMarketBenchmark(clusterSlug: string, estimatedLandedCost?: number): MarketBenchmark {
    const data = MARKET_DATA[clusterSlug];
    if (data) return data;

    // Fallback if no specific data: generate ranges based on landed cost
    const base = estimatedLandedCost || 1000;
    return {
        clusterSlug,
        productName: clusterSlug.replace(/-/g, " "),
        retailLow: Math.round(base * 1.3),
        retailAverage: Math.round(base * 1.8),
        retailHigh: Math.round(base * 2.5),
        currency: "ZAR",
    };
}
