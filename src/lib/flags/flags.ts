/**
 * Feature Flags
 * 
 * Environment-based feature flags for controlled rollout.
 * Can be upgraded to LaunchDarkly/Flipt later.
 */

export const FLAGS = {
    TARIFF_VERSION: "FEATURE_TARIFF_VERSION",
    ENABLE_PAYWALL: "FEATURE_ENABLE_PAYWALL",
    NEW_PAGE_TYPES: "FEATURE_NEW_PAGE_TYPES",
    ENABLE_API: "FEATURE_ENABLE_API",
    ENABLE_WIDGETS: "FEATURE_ENABLE_WIDGETS",
} as const;

export type FlagName = (typeof FLAGS)[keyof typeof FLAGS];

// Flag defaults
const FLAG_DEFAULTS: Record<FlagName, string | boolean> = {
    [FLAGS.TARIFF_VERSION]: "MVP-2026-02",
    [FLAGS.ENABLE_PAYWALL]: false,
    [FLAGS.NEW_PAGE_TYPES]: false,
    [FLAGS.ENABLE_API]: false,
    [FLAGS.ENABLE_WIDGETS]: false,
};

/**
 * Get a feature flag value
 */
export function getFlag(flagName: FlagName): string | boolean {
    const envValue = process.env[flagName];

    if (envValue === undefined) {
        return FLAG_DEFAULTS[flagName];
    }

    // Parse boolean flags
    if (envValue.toLowerCase() === "true") return true;
    if (envValue.toLowerCase() === "false") return false;

    return envValue;
}

/**
 * Check if a boolean feature flag is enabled
 */
export function isFlagEnabled(flagName: FlagName): boolean {
    const value = getFlag(flagName);
    return value === true || value === "true";
}

/**
 * Get the current tariff version
 */
export function getCurrentTariffVersion(): string {
    const version = getFlag(FLAGS.TARIFF_VERSION);
    return typeof version === "string" ? version : "MVP-2026-02";
}

/**
 * Check if paywall is enabled
 */
export function isPaywallEnabled(): boolean {
    return isFlagEnabled(FLAGS.ENABLE_PAYWALL);
}

/**
 * Check if new page types are enabled
 */
export function areNewPageTypesEnabled(): boolean {
    return isFlagEnabled(FLAGS.NEW_PAGE_TYPES);
}

/**
 * Check if API access is enabled
 */
export function isApiEnabled(): boolean {
    return isFlagEnabled(FLAGS.ENABLE_API);
}

/**
 * Check if widget embeds are enabled
 */
export function areWidgetsEnabled(): boolean {
    return isFlagEnabled(FLAGS.ENABLE_WIDGETS);
}

/**
 * Get all flag values (for debugging)
 */
export function getAllFlags(): Record<FlagName, string | boolean> {
    return {
        [FLAGS.TARIFF_VERSION]: getFlag(FLAGS.TARIFF_VERSION),
        [FLAGS.ENABLE_PAYWALL]: getFlag(FLAGS.ENABLE_PAYWALL),
        [FLAGS.NEW_PAGE_TYPES]: getFlag(FLAGS.NEW_PAGE_TYPES),
        [FLAGS.ENABLE_API]: getFlag(FLAGS.ENABLE_API),
        [FLAGS.ENABLE_WIDGETS]: getFlag(FLAGS.ENABLE_WIDGETS),
    };
}
