/**
 * Analytics Event Definitions
 * 
 * Type-safe event definitions for tracking user interactions.
 * These events match the blueprint requirements for funnel analysis.
 */

export const EVENT_NAMES = {
    PAGE_VIEW: "page_view",
    CALC_STARTED: "calc_started",
    CALC_COMPLETED: "calc_completed",
    HS_SUGGESTED: "hs_suggested",
    PAYWALL_VIEWED: "paywall_viewed",
    CHECKOUT_CLICKED: "checkout_clicked",
    SUBSCRIPTION_STARTED: "subscription_started",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

// Base event properties
export type BaseEventProperties = {
    timestamp: string;
    sessionId: string;
    userId?: string;
};

// Page view event
export type PageViewEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.PAGE_VIEW;
    properties: {
        path: string;
        pageType?: string;
        clusterSlug?: string;
        originIso2?: string;
        destIso2?: string;
        referrer?: string;
    };
};

// Calculator started event
export type CalcStartedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.CALC_STARTED;
    properties: {
        pageSlug: string;
        clusterSlug?: string;
        originIso2?: string;
        destIso2?: string;
        hsCode?: string;
        customsValue?: number;
        currency?: string;
    };
};

// Calculator completed event
export type CalcCompletedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.CALC_COMPLETED;
    properties: {
        pageSlug: string;
        clusterSlug?: string;
        originIso2?: string;
        destIso2?: string;
        hsCode?: string;
        customsValue: number;
        currency: string;
        totalDuty: number;
        totalVat: number;
        landedCost: number;
        confidenceLabel: string;
        durationMs: number;
    };
};

// HS code suggested event
export type HsSuggestedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.HS_SUGGESTED;
    properties: {
        searchTerm: string;
        suggestedCodes: string[];
        selectedCode?: string;
        confidence: number;
    };
};

// Paywall viewed event
export type PaywallViewedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.PAYWALL_VIEWED;
    properties: {
        feature: string;
        pageSlug?: string;
        tier?: string;
    };
};

// Checkout clicked event
export type CheckoutClickedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.CHECKOUT_CLICKED;
    properties: {
        tier: string;
        priceId?: string;
        source: string;
    };
};

// Subscription started event
export type SubscriptionStartedEvent = BaseEventProperties & {
    event: typeof EVENT_NAMES.SUBSCRIPTION_STARTED;
    properties: {
        tier: string;
        priceId: string;
        interval: "monthly" | "yearly";
    };
};

// Union type for all events
export type AnalyticsEvent =
    | PageViewEvent
    | CalcStartedEvent
    | CalcCompletedEvent
    | HsSuggestedEvent
    | PaywallViewedEvent
    | CheckoutClickedEvent
    | SubscriptionStartedEvent;
