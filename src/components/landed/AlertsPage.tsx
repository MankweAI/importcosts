"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { AlertRecord } from "@/types/landed-os";
import { getAlerts, setAlertRead } from "@/lib/landed/localStorage";

function formatZar(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function alertTypeLabel(type: AlertRecord["type"]): string {
  if (type === "FX_THRESHOLD") return "FX threshold";
  if (type === "TARIFF_UPDATE") return "Tariff update";
  return "Compliance alert";
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => (typeof window === "undefined" ? [] : getAlerts()));

  const toggleRead = (alertId: string, nextRead: boolean) => {
    setAlerts(setAlertRead(alertId, nextRead));
  };

  return (
    <section className="rounded-[16px] border border-[var(--lc-border)] bg-[var(--lc-surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Alerts feed</h1>
          <p className="mt-1 text-sm text-[var(--lc-muted)]">FX thresholds, tariff updates, and compliance signals tied to saved deals.</p>
        </div>
        <BellRing className="h-6 w-6 text-[var(--lc-muted)]" />
      </div>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--lc-border)] p-6 text-sm text-[var(--lc-muted)]">
          No alerts yet. Save a deal from the <Link href="/" className="underline underline-offset-2">calculator</Link> to start watch tracking.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-xl border border-[var(--lc-border)] p-4"
              style={{ backgroundColor: alert.read ? "transparent" : "color-mix(in srgb, var(--lc-accent) 6%, transparent)" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--lc-muted)]">{alertTypeLabel(alert.type)}</p>
                <label className="inline-flex items-center gap-2 text-xs text-[var(--lc-muted)]">
                  <input
                    type="checkbox"
                    checked={alert.read}
                    onChange={(event) => toggleRead(alert.id, event.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Mark read
                </label>
              </div>
              <p className="mt-2 font-medium">{alert.dealLabel}</p>
              <p className="mt-1 text-sm text-[var(--lc-muted)]">{alert.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--lc-muted)]">
                <span>Impact: {formatZar(alert.impactDeltaZar)}</span>
                <Link href={`/deal/${alert.dealId}`} className="underline underline-offset-2">Open deal</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
