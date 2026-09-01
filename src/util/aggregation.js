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

export const NON_COMPOSABLE_AGGREGATION_TYPES = new Set([
    'AVERAGE',
    'STDDEV',
    'VARIANCE',
])

const DHIS2_TO_COMBINED_AGGREGATION_TYPE = {
    SUM: 'SUM',
    AVERAGE: 'AVERAGE',
    AVERAGE_SUM_ORG_UNIT: 'SUM',
    COUNT: 'COUNT',
    MIN: 'MIN',
    MAX: 'MAX',
    STDDEV: 'STDDEV',
    VARIANCE: 'VARIANCE',
}

const RATIO_DIMENSION_ITEM_TYPES = new Set(['INDICATOR', 'REPORTING_RATE'])

export const getDefaultCombinedAggregationType = (
    dataItemAggregationType,
    dimensionItemType
) => {
    if (RATIO_DIMENSION_ITEM_TYPES.has(dimensionItemType)) {
        return 'AVERAGE'
    }
    return DHIS2_TO_COMBINED_AGGREGATION_TYPE[dataItemAggregationType] ?? 'SUM'
}

const EARTH_ENGINE_TO_COMBINED_AGGREGATION_TYPE = {
    count: 'COUNT',
    min: 'MIN',
    max: 'MAX',
    mean: 'AVERAGE',
    sum: 'SUM',
    stdDev: 'STDDEV',
    variance: 'VARIANCE',
}

export const getDefaultCombinedAggregationTypeFromEarthEngineStat = (stat) =>
    EARTH_ENGINE_TO_COMBINED_AGGREGATION_TYPE[stat] ?? 'SUM'
