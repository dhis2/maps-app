import {
    applyAggregation,
    getDefaultCombinedAggregationType,
    getDefaultCombinedAggregationTypeFromEarthEngineStat,
} from '../aggregation.js'

describe('applyAggregation', () => {
    test('returns null for an empty input (no matching feature)', () => {
        expect(applyAggregation('SUM', [])).toBeNull()
    })

    test('SUM', () => {
        expect(applyAggregation('SUM', [1, 2, 3])).toBe(6)
    })

    test('AVERAGE', () => {
        expect(applyAggregation('AVERAGE', [1, 2, 3])).toBe(2)
    })

    test('COUNT', () => {
        expect(applyAggregation('COUNT', [10, 20, 30, 40])).toBe(4)
    })

    test('MIN', () => {
        expect(applyAggregation('MIN', [5, 1, 9])).toBe(1)
    })

    test('MAX', () => {
        expect(applyAggregation('MAX', [5, 1, 9])).toBe(9)
    })

    test('VARIANCE', () => {
        expect(applyAggregation('VARIANCE', [2, 4, 4, 4, 5, 5, 7, 9])).toBe(4)
    })

    test('STDDEV', () => {
        expect(applyAggregation('STDDEV', [2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
    })

    test('a single value aggregates to itself regardless of type', () => {
        expect(applyAggregation('SUM', [42])).toBe(42)
        expect(applyAggregation('AVERAGE', [42])).toBe(42)
        expect(applyAggregation('MIN', [42])).toBe(42)
        expect(applyAggregation('MAX', [42])).toBe(42)
    })

    test('returns null for an unknown aggregation type', () => {
        expect(applyAggregation('NOT_A_TYPE', [1, 2, 3])).toBeNull()
    })
})

describe('getDefaultCombinedAggregationType', () => {
    test('maps directly for types with a 1:1 equivalent', () => {
        expect(getDefaultCombinedAggregationType('SUM')).toBe('SUM')
        expect(getDefaultCombinedAggregationType('AVERAGE')).toBe('AVERAGE')
        expect(getDefaultCombinedAggregationType('COUNT')).toBe('COUNT')
        expect(getDefaultCombinedAggregationType('MIN')).toBe('MIN')
        expect(getDefaultCombinedAggregationType('MAX')).toBe('MAX')
        expect(getDefaultCombinedAggregationType('STDDEV')).toBe('STDDEV')
        expect(getDefaultCombinedAggregationType('VARIANCE')).toBe('VARIANCE')
    })

    test('maps AVERAGE_SUM_ORG_UNIT to SUM - Combined only ever rolls up across org units', () => {
        expect(getDefaultCombinedAggregationType('AVERAGE_SUM_ORG_UNIT')).toBe(
            'SUM'
        )
    })

    test('falls back to SUM for NONE, CUSTOM, unrecognized, or missing types', () => {
        expect(getDefaultCombinedAggregationType('NONE')).toBe('SUM')
        expect(getDefaultCombinedAggregationType('CUSTOM')).toBe('SUM')
        expect(getDefaultCombinedAggregationType('NOT_A_TYPE')).toBe('SUM')
        expect(getDefaultCombinedAggregationType(undefined)).toBe('SUM')
    })

    test('defaults a plain Indicator to AVERAGE regardless of aggregationType - it has none of its own, and its value is a ratio not meaningfully summed across org units', () => {
        expect(getDefaultCombinedAggregationType(undefined, 'INDICATOR')).toBe(
            'AVERAGE'
        )
        expect(getDefaultCombinedAggregationType('SUM', 'INDICATOR')).toBe(
            'AVERAGE'
        )
    })

    test('defaults Reporting rate to AVERAGE - same reasoning as Indicators, it has no aggregationType of its own and its value is always a ratio', () => {
        expect(
            getDefaultCombinedAggregationType(undefined, 'REPORTING_RATE')
        ).toBe('AVERAGE')
    })
})

describe('getDefaultCombinedAggregationTypeFromEarthEngineStat', () => {
    test('maps each Earth Engine stat id to its equivalent', () => {
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('count')
        ).toBe('COUNT')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('min')
        ).toBe('MIN')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('max')
        ).toBe('MAX')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('mean')
        ).toBe('AVERAGE')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('sum')
        ).toBe('SUM')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('stdDev')
        ).toBe('STDDEV')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('variance')
        ).toBe('VARIANCE')
    })

    test('falls back to SUM for median (no equivalent reducer) or an unrecognized stat', () => {
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('median')
        ).toBe('SUM')
        expect(
            getDefaultCombinedAggregationTypeFromEarthEngineStat('not-a-stat')
        ).toBe('SUM')
    })
})
