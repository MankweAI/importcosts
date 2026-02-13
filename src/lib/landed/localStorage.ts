import { AlertRecord, SavedDealRecord } from "@/types/landed-os";

const DEALS_KEY = "lcos.saved.deals";
const ALERTS_KEY = "lcos.alerts";
const INSTALL_ELIGIBLE_KEY = "lcos.install.eligible";
const SUCCESSFUL_CALCS_KEY = "lcos.successful.calcs";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedDeals(): SavedDealRecord[] {
  return readJson<SavedDealRecord[]>(DEALS_KEY, []);
}

export function getSavedDeal(dealId: string): SavedDealRecord | null {
  const deals = getSavedDeals();
  return deals.find((deal) => deal.id === dealId) ?? null;
}

export function upsertSavedDeal(nextDeal: SavedDealRecord): SavedDealRecord[] {
  const deals = getSavedDeals();
  const existingIndex = deals.findIndex((deal) => deal.id === nextDeal.id);

  if (existingIndex >= 0) {
    deals[existingIndex] = nextDeal;
  } else {
    deals.unshift(nextDeal);
  }

  writeJson(DEALS_KEY, deals);
  markInstallEligible();
  return deals;
}

export function trackSuccessfulCalculation(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const current = Number(window.localStorage.getItem(SUCCESSFUL_CALCS_KEY) ?? 0);
  const next = current + 1;
  window.localStorage.setItem(SUCCESSFUL_CALCS_KEY, String(next));
  if (next >= 2) {
    markInstallEligible();
  }

  return next;
}

export function isInstallEligible(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(INSTALL_ELIGIBLE_KEY) === "true";
}

export function markInstallEligible(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INSTALL_ELIGIBLE_KEY, "true");
}

export function getAlerts(): AlertRecord[] {
  return readJson<AlertRecord[]>(ALERTS_KEY, []);
}

export function seedAlertsFromDeal(deal: SavedDealRecord): void {
  const alerts = getAlerts();
  const now = new Date().toISOString();

  const generated: AlertRecord[] = [
    {
      id: `${deal.id}-fx`,
      dealId: deal.id,
      dealLabel: deal.label,
      type: "FX_THRESHOLD",
      message: "USD/ZAR moved by 4.2% since your saved run.",
      createdAt: now,
      impactDeltaZar: Math.round(deal.result.totalLandedCost * 0.042),
      read: false,
    },
    {
      id: `${deal.id}-tariff`,
      dealId: deal.id,
      dealLabel: deal.label,
      type: "TARIFF_UPDATE",
      message: "Tariff dataset has a newer published version.",
      createdAt: now,
      impactDeltaZar: Math.round(deal.result.totalLandedCost * 0.018),
      read: false,
    },
  ];

  const deduped = alerts.filter((existing) => !generated.some((nextAlert) => nextAlert.id === existing.id));
  writeJson(ALERTS_KEY, [...generated, ...deduped]);
}

export function setAlertRead(alertId: string, read: boolean): AlertRecord[] {
  const next = getAlerts().map((alert) => (alert.id === alertId ? { ...alert, read } : alert));
  writeJson(ALERTS_KEY, next);
  return next;
}
