/**
 * Egress guard — asserts that no analytics values or geometry leave the browser.
 *
 * In dev mode, throws if a suspicious payload is detected.
 * In production, logs a warning only (fail-open to avoid blocking the app).
 *
 * "Analytics values" = numeric data from /api/analytics, /api/events, etc.
 * "Geometry" = GeoJSON coordinates
 *
 * For the PoC (Tier 1, metadata-only), the only content allowed to leave is:
 *   - User's input text
 *   - Metadata labels (displayName, name strings from search results)
 *   - org unit ids, data item ids, period ids
 */

const isDev = process.env.NODE_ENV === 'development'

/** Fields that would indicate analytics values are in the payload */
const ANALYTICS_VALUE_KEYS = [
    'value',
    'numerator',
    'denominator',
    'factor',
    'multiplier',
]

/** Simple check: does the object tree contain analytics value fields? */
const containsAnalyticsValues = (obj, depth = 0) => {
    if (depth > 5 || obj == null || typeof obj !== 'object') {
        return false
    }
    for (const key of Object.keys(obj)) {
        if (
            ANALYTICS_VALUE_KEYS.includes(key) &&
            typeof obj[key] === 'number'
        ) {
            return true
        }
        if (containsAnalyticsValues(obj[key], depth + 1)) {
            return true
        }
    }
    return false
}

/** Check for GeoJSON geometry */
const containsGeometry = (obj, depth = 0) => {
    if (depth > 5 || obj == null || typeof obj !== 'object') {
        return false
    }
    if (
        obj.type === 'FeatureCollection' ||
        obj.type === 'Feature' ||
        obj.coordinates
    ) {
        return true
    }
    for (const val of Object.values(obj)) {
        if (containsGeometry(val, depth + 1)) {
            return true
        }
    }
    return false
}

/**
 * Assert that the outbound payload contains no analytics values or geometry.
 * @param {Object} payload - The object about to be sent to the LLM
 * @param {string} [context] - Description for error messages
 */
export const assertMetadataOnly = (payload, context = 'outbound payload') => {
    if (containsAnalyticsValues(payload)) {
        const msg = `[AI Egress Guard] Analytics values detected in ${context}. This violates the metadata-only egress policy.`
        if (isDev) {
            throw new Error(msg)
        } else {
            console.warn(msg)
        }
    }

    if (containsGeometry(payload)) {
        const msg = `[AI Egress Guard] GeoJSON geometry detected in ${context}. This violates the metadata-only egress policy.`
        if (isDev) {
            throw new Error(msg)
        } else {
            console.warn(msg)
        }
    }
}

/**
 * Wrap a message array before sending to the LLM, asserting no sensitive data.
 * @param {Array} messages
 * @returns {Array} the same messages (pass-through after check)
 */
export const guardMessages = (messages) => {
    assertMetadataOnly(messages, 'messages array')
    return messages
}
