"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isInstallEligible } from "@/lib/landed/localStorage";

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return !window.navigator.onLine;
  });
  const [eligible, setEligible] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return isInstallEligible();
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onlineHandler = () => setIsOffline(false);
    const offlineHandler = () => setIsOffline(true);

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("service worker registration failed", error);
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const installHandler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", installHandler);
    return () => window.removeEventListener("beforeinstallprompt", installHandler);
  }, []);

  const canInstall = useMemo(() => eligible && deferredPrompt !== null, [deferredPrompt, eligible]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const refreshEligibility = useCallback(() => {
    setEligible(isInstallEligible());
  }, []);

  return {
    isOffline,
    canInstall,
    promptInstall,
    refreshEligibility,
  };
}
