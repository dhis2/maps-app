// Reducers for combining several raw values into one, keyed by the same
// ids getCombinedAggregationTypes() (constants/aggregationTypes.js) offers -
// used by the Combined data table's join when a participating layer has
// more than one feature matching a single reference org unit row.
const AGGREGATIONS = {
    SUM: (values) => values.reduce((a, b) => a + b, 0),
    AVERAGE: (values) => values.reduce((a, b) => a + b, 0) / values.length,
    COUNT: (values) => values.length,
    MIN: (values) => Math.min(...values),
    MAX: (values) => Math.max(...values),
    STDDEV: (values) => Math.sqrt(variance(values)),
    VARIANCE: (values) => variance(values),
}

const variance = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
}

// Returns null for an empty input (no matching feature) rather than NaN.
export const applyAggregation = (type, values) => {
    if (!values.length) {
        return null
    }
    const aggregate = AGGREGATIONS[type]
    return aggregate ? aggregate(values) : null
}
