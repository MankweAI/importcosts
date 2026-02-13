"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Download, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandedTopBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onInstall: () => void;
  canInstall: boolean;
  showInstallNudge?: boolean;
}

const NAV = [
  { href: "/", label: "Calculator" },
  { href: "/compare", label: "Compare" },
  { href: "/alerts", label: "Alerts" },
];

export function LandedTopBar({
  darkMode,
  onToggleDarkMode,
  onInstall,
  canInstall,
  showInstallNudge = false,
}: LandedTopBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--lc-border)] bg-[var(--lc-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--lc-accent)] text-sm font-semibold text-white">LC</span>
            <span className="text-sm font-semibold tracking-tight">LandedCost OS</span>
          </Link>
          <span className="hidden rounded-full border border-[var(--lc-border)] px-2.5 py-1 text-xs text-[var(--lc-muted)] sm:inline-flex">
            CN -&gt; ZA
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-1.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-[color-mix(in_srgb,var(--lc-accent)_14%,transparent)] text-[var(--lc-text)]"
                  : "text-[var(--lc-muted)] hover:text-[var(--lc-text)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-xl border border-[var(--lc-border)] px-3 py-1.5 text-xs text-[var(--lc-muted)] lg:flex">
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Search HS/product
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link
            href="/alerts"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--lc-muted)] hover:bg-[var(--lc-subtle)] hover:text-[var(--lc-text)]"
            aria-label="Open alerts"
          >
            <Bell className="h-4 w-4" />
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-xl border-[var(--lc-border)] md:inline-flex"
            onClick={onInstall}
            disabled={!canInstall}
            title={canInstall ? "Install app" : "Install becomes available after 2 successful calculations or after saving a deal."}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Install
          </Button>

          <details className="relative">
            <summary className="list-none">
              <span className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--lc-muted)] hover:bg-[var(--lc-subtle)] hover:text-[var(--lc-text)]">
                <Menu className="h-4 w-4" />
              </span>
            </summary>
            <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-[var(--lc-border)] bg-[var(--lc-surface)] p-2 shadow-lg">
              <Link href="/" className="block rounded-lg px-2 py-1.5 text-sm text-[var(--lc-text)] hover:bg-[var(--lc-subtle)]">Calculator</Link>
              <Link href="/compare" className="block rounded-lg px-2 py-1.5 text-sm text-[var(--lc-text)] hover:bg-[var(--lc-subtle)]">Compare</Link>
              <Link href="/alerts" className="block rounded-lg px-2 py-1.5 text-sm text-[var(--lc-text)] hover:bg-[var(--lc-subtle)]">Alerts</Link>
              <button
                type="button"
                className="mt-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm text-[var(--lc-text)] hover:bg-[var(--lc-subtle)] disabled:opacity-50"
                onClick={onInstall}
                disabled={!canInstall}
              >
                Install app
              </button>
            </div>
          </details>
        </div>
      </div>

      {showInstallNudge && canInstall && (
        <div className="border-t border-[var(--lc-border)] bg-[var(--lc-subtle)] px-4 py-2 text-center text-xs text-[var(--lc-muted)]">
          App install is now available from the top bar.
        </div>
      )}
    </header>
  );
}
