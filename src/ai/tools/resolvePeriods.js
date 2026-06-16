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

// Match quarter references: "Q1 2023", "2023 Q1", "Q2 of 2024", "2023-Q3", "2023Q4"
const QUARTER_PATTERN =
    /\b(?:Q([1-4])\s*(?:of\s*)?(\d{4})|(\d{4})[\s-]?Q([1-4]))\b/i

// Match specific month: "January 2023", "Jan 2024", "2023-01", etc.
const MONTH_NAMES = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
]
const MONTH_ABBR = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
]
const MONTH_NAME_PATTERN =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i
const NUMERIC_MONTH_PATTERN = /\b(\d{4})[-/](\d{2})\b/

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

        // Try quarter: "Q1 2023" or "2023Q1" or "2023-Q1"
        const qMatch = description.match(QUARTER_PATTERN)
        if (qMatch) {
            const quarter = qMatch[1] ?? qMatch[4]
            const year = qMatch[2] ?? qMatch[3]
            return {
                resolved: true,
                periods: [`${year}Q${quarter}`],
                description,
            }
        }

        // Try named month: "January 2023"
        const monthNameMatch = description.match(MONTH_NAME_PATTERN)
        if (monthNameMatch) {
            const monthStr = monthNameMatch[1].toLowerCase()
            const year = monthNameMatch[2]
            let monthNum = MONTH_NAMES.indexOf(monthStr) + 1
            if (monthNum === 0) {
                monthNum = MONTH_ABBR.indexOf(monthStr) + 1
            }
            if (monthNum > 0) {
                const mm = String(monthNum).padStart(2, '0')
                return {
                    resolved: true,
                    periods: [`${year}${mm}`],
                    description,
                }
            }
        }

        // Try numeric month: "2023-01"
        const numMonthMatch = description.match(NUMERIC_MONTH_PATTERN)
        if (numMonthMatch) {
            return {
                resolved: true,
                periods: [`${numMonthMatch[1]}${numMonthMatch[2]}`],
                description,
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
            message: `Could not resolve "${description}" to a DHIS2 period. Try phrases like "last 12 months", "this year", "last quarter", "Q1 2023", "January 2024", or a year like "2024".`,
            suggestions: PERIOD_MAP.slice(0, 6).map((p) => p.id),
        }
    }
