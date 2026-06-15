/**
 * Resolve natural-language period descriptions to DHIS2 relative period ids.
 * Resolved entirely locally — nothing leaves the browser.
 *
 * Returns standard DHIS2 relative period ids like LAST_12_MONTHS, THIS_YEAR, etc.
 */

const PERIOD_MAP = [
    {
        patterns: [/last\s+12\s+months?/i, /past\s+12\s+months?/i],
        id: 'LAST_12_MONTHS',
    },
    {
        patterns: [/last\s+6\s+months?/i, /past\s+6\s+months?/i],
        id: 'LAST_6_MONTHS',
    },
    { patterns: [/last\s+3\s+months?/i], id: 'LAST_3_MONTHS' },
    { patterns: [/this\s+month/i, /current\s+month/i], id: 'THIS_MONTH' },
    { patterns: [/last\s+month/i, /previous\s+month/i], id: 'LAST_MONTH' },
    { patterns: [/this\s+quarter/i, /current\s+quarter/i], id: 'THIS_QUARTER' },
    {
        patterns: [/last\s+quarter/i, /previous\s+quarter/i],
        id: 'LAST_QUARTER',
    },
    { patterns: [/this\s+year/i, /current\s+year/i], id: 'THIS_YEAR' },
    { patterns: [/last\s+year/i, /previous\s+year/i], id: 'LAST_YEAR' },
    { patterns: [/last\s+5\s+years?/i], id: 'LAST_5_YEARS' },
    { patterns: [/last\s+2\s+years?/i], id: 'LAST_2_YEARS' },
    { patterns: [/this\s+financial\s+year/i], id: 'THIS_FINANCIAL_YEAR' },
    { patterns: [/last\s+financial\s+year/i], id: 'LAST_FINANCIAL_YEAR' },
    { patterns: [/last\s+week/i], id: 'LAST_WEEK' },
    { patterns: [/this\s+week/i], id: 'THIS_WEEK' },
    { patterns: [/last\s+52\s+weeks?/i], id: 'LAST_52_WEEKS' },
]

// Match a bare 4-digit year like "2024" or "in 2023"
const FIXED_YEAR_PATTERN = /\b(20\d{2})\b/

/**
 * @returns {(args: {description: string}) => Promise<Object>}
 */
export const makeResolvePeriods =
    () =>
    async ({ description }) => {
        // Try relative period patterns first
        for (const { patterns, id } of PERIOD_MAP) {
            if (patterns.some((p) => p.test(description))) {
                return { resolved: true, periods: [id], description }
            }
        }

        // Try fixed year
        const yearMatch = description.match(FIXED_YEAR_PATTERN)
        if (yearMatch) {
            return { resolved: true, periods: [yearMatch[1]], description }
        }

        return {
            resolved: false,
            periods: [],
            message: `Could not resolve "${description}" to a DHIS2 period. Try phrases like "last 12 months", "this year", "last quarter", or a year like "2024".`,
            suggestions: PERIOD_MAP.slice(0, 6).map((p) => p.id),
        }
    }
