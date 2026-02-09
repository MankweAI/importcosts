export const trackEvent = (eventName: string, props: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, props);
    } else {
        console.log(`[Analytics] ${eventName}`, props);
    }
};
