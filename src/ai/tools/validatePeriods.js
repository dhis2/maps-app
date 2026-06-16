/**
 * Validate DHIS2 period IDs before passing them to add/update layer tools.
 * Pure client-side — no API calls needed.
 */

const RELATIVE_PERIODS = new Set([
    'THIS_WEEK',
    'LAST_WEEK',
    'LAST_4_WEEKS',
    'LAST_12_WEEKS',
    'LAST_52_WEEKS',
    'THIS_MONTH',
    'LAST_MONTH',
    'LAST_3_MONTHS',
    'LAST_6_MONTHS',
    'LAST_12_MONTHS',
    'LAST_6_BIMONTHS',
    'THIS_BIMONTH',
    'LAST_BIMONTH',
    'THIS_QUARTER',
    'LAST_QUARTER',
    'LAST_4_QUARTERS',
    'THIS_SIX_MONTH',
    'LAST_SIX_MONTH',
    'LAST_2_SIXMONTHS',
    'THIS_YEAR',
    'LAST_YEAR',
    'LAST_5_YEARS',
    'LAST_10_YEARS',
    'THIS_FINANCIAL_YEAR',
    'LAST_FINANCIAL_YEAR',
    'LAST_5_FINANCIAL_YEARS',
])

// Fixed period patterns (regex applied after uppercasing)
const FIXED_PATTERNS = [
    /^\d{4}$/, // year: 2023
    /^\d{4}Q[1-4]$/, // quarter: 2023Q1
    /^\d{4}(0[1-9]|1[0-2])$/, // month: 202301–202312
    /^\d{4}W([1-9]|[1-4]\d|5[0-3])$/, // week: 2023W1–2023W53
    /^\d{4}0[1-6]B$/, // bimonth: 202301B–202306B
    /^\d{4}S[12]$/, // six-month: 2023S1, 2023S2
    /^\d{4}(April|July|Oct|Nov)$/, // financial year variants
]

const isValidPeriod = (id) => {
    if (RELATIVE_PERIODS.has(id)) {
        return true
    }
    return FIXED_PATTERNS.some((re) => re.test(id))
}

const getSuggestion = (id) => {
    const up = id.toUpperCase()
    // Looks like a natural language description — call resolve_periods
    if (/\s/.test(id) || /FLOATING|CUSTOM|ROLLING/i.test(id)) {
        return `"${id}" is not a valid DHIS2 period id. Call resolve_periods with a natural language description like "last year" or "last 5 years".`
    }
    // Might be a variant of a relative period
    if (/^(PREVIOUS|CURRENT)_/.test(up)) {
        const corrected = up
            .replace(/^PREVIOUS_/, 'LAST_')
            .replace(/^CURRENT_/, 'THIS_')
        if (RELATIVE_PERIODS.has(corrected)) {
            return `Did you mean "${corrected}"? Use LAST_ instead of PREVIOUS_ and THIS_ instead of CURRENT_.`
        }
    }
    return `"${id}" is not a recognized DHIS2 period id. Call resolve_periods with a natural language period description to get a valid id.`
}

/**
 * @returns {(args: { periods: string[] }) => Promise<Object>}
 */
export const makeValidatePeriods =
    () =>
    async ({ periods }) => {
        if (!Array.isArray(periods) || periods.length === 0) {
            return {
                allValid: false,
                error: 'periods must be a non-empty array of period id strings.',
            }
        }

        const results = periods.map((id) => {
            const valid = isValidPeriod(id)
            return valid
                ? { period: id, valid: true }
                : { period: id, valid: false, suggestion: getSuggestion(id) }
        })

        const allValid = results.every((r) => r.valid)
        return {
            allValid,
            results,
            ...(allValid
                ? { message: 'All period ids are valid.' }
                : {
                      message:
                          'One or more period ids are invalid. Fix them before calling add_thematic_layer or update_layer.',
                  }),
        }
    }
