"use client";

import { ReactNode, useEffect, useState } from "react";
import { LandedTopBar } from "@/components/landed/LandedTopBar";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface LandedPageFrameProps {
  children: ReactNode;
}

export function LandedPageFrame({ children }: LandedPageFrameProps) {
  const [darkMode, setDarkMode] = useState(false);
  const { canInstall, promptInstall } = usePWAInstall();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[var(--lc-bg)] text-[var(--lc-text)]">
      <LandedTopBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onInstall={async () => {
          await promptInstall();
        }}
        canInstall={canInstall}
      />
      <main className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
