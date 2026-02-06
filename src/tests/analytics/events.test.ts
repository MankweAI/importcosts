/**
 * Analytics Events Unit Tests
 * 
 * Tests for event tracking and ID generation.
 */

import { EVENT_NAMES } from "@/lib/analytics/events";
import { generateEventId, track } from "@/lib/analytics/tracker";

describe("Analytics Events", () => {
    describe("EVENT_NAMES", () => {
        it("has all required event types", () => {
            expect(EVENT_NAMES.PAGE_VIEW).toBe("page_view");
            expect(EVENT_NAMES.CALC_STARTED).toBe("calc_started");
            expect(EVENT_NAMES.CALC_COMPLETED).toBe("calc_completed");
            expect(EVENT_NAMES.HS_SUGGESTED).toBe("hs_suggested");
            expect(EVENT_NAMES.PAYWALL_VIEWED).toBe("paywall_viewed");
            expect(EVENT_NAMES.CHECKOUT_CLICKED).toBe("checkout_clicked");
            expect(EVENT_NAMES.SUBSCRIPTION_STARTED).toBe("subscription_started");
        });
    });

    describe("generateEventId", () => {
        it("generates unique IDs", () => {
            const ids = new Set<string>();
            for (let i = 0; i < 100; i++) {
                ids.add(generateEventId());
            }
            expect(ids.size).toBe(100);
        });

        it("generates IDs with expected format", () => {
            const id = generateEventId();
            expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
        });

        it("generates IDs of reasonable length", () => {
            const id = generateEventId();
            expect(id.length).toBeGreaterThan(10);
            expect(id.length).toBeLessThan(30);
        });
    });

    describe("track", () => {
        let consoleSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, "log").mockImplementation();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it("logs events in development mode", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            track(EVENT_NAMES.PAGE_VIEW, { path: "/test" });

            expect(consoleSpy).toHaveBeenCalledWith(
                "[Analytics]",
                "page_view",
                expect.objectContaining({
                    event: "page_view",
                    properties: { path: "/test" },
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it("includes timestamp in tracked events", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            track(EVENT_NAMES.CALC_STARTED, { pageSlug: "/test" });

            expect(consoleSpy).toHaveBeenCalledWith(
                "[Analytics]",
                "calc_started",
                expect.objectContaining({
                    timestamp: expect.any(String),
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it("includes eventId in tracked events", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            track(EVENT_NAMES.CALC_COMPLETED, {
                pageSlug: "/test",
                customsValue: 10000,
                currency: "ZAR",
                totalDuty: 1500,
                totalVat: 1725,
                landedCost: 13225,
                confidenceLabel: "HIGH",
                durationMs: 250,
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                "[Analytics]",
                "calc_completed",
                expect.objectContaining({
                    eventId: expect.any(String),
                })
            );

            process.env.NODE_ENV = originalEnv;
        });

        it("includes userId when provided", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            track(EVENT_NAMES.PAYWALL_VIEWED, { feature: "export" }, "user-123");

            expect(consoleSpy).toHaveBeenCalledWith(
                "[Analytics]",
                "paywall_viewed",
                expect.objectContaining({
                    userId: "user-123",
                })
            );

            process.env.NODE_ENV = originalEnv;
        });
    });
});
