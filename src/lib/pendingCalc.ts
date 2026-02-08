import type { CalcInput, CalcOutput } from "@/lib/calc/types";

const STORAGE_KEY = "ic_pending_calc";

export type PendingCalcPayload = {
    input: CalcInput;
    result: CalcOutput;
    source?: string;
    createdAt: string;
};

export function storePendingCalc(payload: PendingCalcPayload) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.error("Failed to store pending calculation", e);
    }
}

export function readPendingCalc(): PendingCalcPayload | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as PendingCalcPayload;
    } catch (e) {
        console.error("Failed to parse pending calculation", e);
        return null;
    }
}

export function clearPendingCalc() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
}
