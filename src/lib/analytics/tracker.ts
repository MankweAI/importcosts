/**
 * Analytics Tracker
 * 
 * Universal tracking function with stable event IDs.
 * Console logging in dev, ready for GA4/Posthog integration.
 */

import {
    EVENT_NAMES,
    type EventName,
    type AnalyticsEvent,
    type BaseEventProperties
} from "./events";

// Session ID management
let sessionId: string | null = null;

/**
 * Generate a stable session ID
 */
function getSessionId(): string {
    if (sessionId) return sessionId;

    // Check if we're in browser
    if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("ic_session_id");
        if (stored) {
            sessionId = stored;
            return sessionId;
        }
    }

    // Generate new session ID
    sessionId = generateEventId();

    if (typeof window !== "undefined") {
        sessionStorage.setItem("ic_session_id", sessionId);
    }

    return sessionId;
}

/**
 * Generate a unique event ID
 */
export function generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
}

/**
 * Get base event properties
 */
function getBaseProperties(userId?: string): BaseEventProperties {
    return {
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        userId,
    };
}

/**
 * Track an analytics event
 */
export function track<T extends EventName>(
    eventName: T,
    properties: Record<string, unknown>,
    userId?: string
): void {
    const baseProps = getBaseProperties(userId);

    const event = {
        event: eventName,
        ...baseProps,
        properties,
        eventId: generateEventId(),
    };

    // Development logging
    if (process.env.NODE_ENV === "development") {
        console.log("[Analytics]", eventName, event);
    }

    // Future: Send to analytics provider
    // sendToGA4(event);
    // sendToPosthog(event);

    // For now, store in a queue for batch sending
    queueEvent(event as TrackedEvent);
}

// Generic tracked event type for queue
type TrackedEvent = {
    event: EventName;
    timestamp: string;
    sessionId: string;
    userId?: string;
    eventId: string;
    properties: Record<string, unknown>;
};

// Event queue for batch processing
const eventQueue: TrackedEvent[] = [];
const MAX_QUEUE_SIZE = 50;

/**
 * Queue an event for batch sending
 */
function queueEvent(event: TrackedEvent): void {
    eventQueue.push(event);

    if (eventQueue.length >= MAX_QUEUE_SIZE) {
        flushEvents();
    }
}

/**
 * Flush queued events (placeholder for future implementation)
 */
export function flushEvents(): void {
    if (eventQueue.length === 0) return;

    if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Flushing", eventQueue.length, "events");
    }

    // Future: Send batch to analytics endpoint
    // await fetch("/api/analytics", { 
    //   method: "POST", 
    //   body: JSON.stringify(eventQueue) 
    // });

    eventQueue.length = 0;
}

// Convenience tracking functions

export function trackPageView(path: string, metadata?: {
    pageType?: string;
    clusterSlug?: string;
    originIso2?: string;
    destIso2?: string;
    referrer?: string;
}, userId?: string): void {
    track(EVENT_NAMES.PAGE_VIEW, { path, ...metadata }, userId);
}

export function trackCalcStarted(data: {
    pageSlug: string;
    clusterSlug?: string;
    originIso2?: string;
    destIso2?: string;
    hsCode?: string;
    customsValue?: number;
    currency?: string;
}, userId?: string): void {
    track(EVENT_NAMES.CALC_STARTED, data, userId);
}

export function trackCalcCompleted(data: {
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
}, userId?: string): void {
    track(EVENT_NAMES.CALC_COMPLETED, data, userId);
}

export function trackHsSuggested(data: {
    searchTerm: string;
    suggestedCodes: string[];
    selectedCode?: string;
    confidence: number;
}, userId?: string): void {
    track(EVENT_NAMES.HS_SUGGESTED, data, userId);
}

export function trackPaywallViewed(data: {
    feature: string;
    pageSlug?: string;
    tier?: string;
}, userId?: string): void {
    track(EVENT_NAMES.PAYWALL_VIEWED, data, userId);
}

export function trackCheckoutClicked(data: {
    tier: string;
    priceId?: string;
    source: string;
}, userId?: string): void {
    track(EVENT_NAMES.CHECKOUT_CLICKED, data, userId);
}

export function trackSubscriptionStarted(data: {
    tier: string;
    priceId: string;
    interval: "monthly" | "yearly";
}, userId?: string): void {
    track(EVENT_NAMES.SUBSCRIPTION_STARTED, data, userId);
}
