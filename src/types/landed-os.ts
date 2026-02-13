export type FreightMode = "SEA" | "AIR";

export interface LocalDealInputs {
  productDescription: string;
  quantity: number;
  unitPrice: number;
  currency: "USD" | "CNY" | "ZAR";
  incoterm: "FOB" | "CIF";
  mode: FreightMode;
  freightPreset: "LOW" | "TYPICAL" | "HIGH";
  freightCost: number;
  sellingPricePerUnit: number;
  insuranceCost: number;
  fxOverride: number;
  otherCosts: number;
  hsCode: string;
}

export interface StressResult {
  label: string;
  deltaTotal: number;
  deltaMargin: number | null;
}

export interface SavedDealRecord {
  id: string;
  label: string;
  lane: string;
  savedAt: string;
  tariffVersion: string;
  tariffUpdatedDate: string;
  fxSource: string;
  fxTimestamp: string;
  inputs: LocalDealInputs;
  result: {
    totalLandedCost: number;
    landedPerUnit: number;
    marginPct: number | null;
    profitPerUnit: number | null;
    breakEvenPerUnit: number | null;
    verdict: "GO" | "CAUTION" | "NO-GO";
    lineItems: Array<{ key: string; label: string; amount: number; formula?: string }>;
    topRisks: Array<{ title: string; why: string; mitigation: string }>;
    checklist: Array<{ title: string; why: string; owner: string; when: string }>;
  };
}

export interface AlertRecord {
  id: string;
  dealId: string;
  dealLabel: string;
  type: "FX_THRESHOLD" | "TARIFF_UPDATE" | "COMPLIANCE";
  message: string;
  createdAt: string;
  impactDeltaZar: number;
  read: boolean;
}
