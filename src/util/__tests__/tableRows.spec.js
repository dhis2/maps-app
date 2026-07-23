import {
    GEOJSON_URL_LAYER,
    THEMATIC_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../constants/layers.js'
import { buildTableData, ERROR_NO_VALID_DATA } from '../tableRows.js'

const feature = (id, extraProperties = {}, coordinates = [10, 10]) => ({
    id,
    geometry: { type: 'Point', coordinates },
    properties: { id, ...extraProperties },
})

describe('buildTableData - error paths', () => {
    test('server-clustered layers return empty data instead of an error', () => {
        expect(buildTableData(THEMATIC_LAYER, { serverCluster: true })).toEqual(
            { data: [] }
        )
    })

    test('no data and no dataWithoutCoords returns a no-valid-data error', () => {
        expect(
            buildTableData(THEMATIC_LAYER, { data: [], dataWithoutCoords: [] })
        ).toEqual({ errorCode: ERROR_NO_VALID_DATA })
        expect(buildTableData(THEMATIC_LAYER, {})).toEqual({
            errorCode: ERROR_NO_VALID_DATA,
        })
    })
})

describe('buildTableData - geoJsonUrl layer', () => {
    test('returns each feature’s properties as a row, bypassing the hasAdditionalGeometry filter', () => {
        const data = [
            feature('a', { name: 'A', hasAdditionalGeometry: true }),
            feature('b', { name: 'B' }),
        ]
        const result = buildTableData(GEOJSON_URL_LAYER, { data })
        expect(result.data).toEqual([
            { id: 'a', name: 'A', hasAdditionalGeometry: true, index: 0 },
            { id: 'b', name: 'B', index: 1 },
        ])
    })

    test('stamps a row-order index so clearing a sort restores natural order', () => {
        const data = [feature('a'), feature('b'), feature('c')]
        const result = buildTableData(GEOJSON_URL_LAYER, { data })
        expect(result.data.map((r) => r.index)).toEqual([0, 1, 2])
    })
})

describe('buildTableData - showOnlyFeaturesInView', () => {
    const inBounds = feature('in', {}, [10, 10])
    const outOfBounds = feature('out', {}, [100, 100])
    const bounds = [0, 0, 20, 20]

    test('keeps all features when showOnlyFeaturesInView is off', () => {
        const result = buildTableData(THEMATIC_LAYER, {
            data: [inBounds, outOfBounds],
            showOnlyFeaturesInView: false,
            mapBounds: bounds,
            aggregations: {},
        })
        expect(result.data.map((r) => r.id)).toEqual(['in', 'out'])
    })

    test('filters out features outside the given bounds when showOnlyFeaturesInView is on', () => {
        const result = buildTableData(THEMATIC_LAYER, {
            data: [inBounds, outOfBounds],
            showOnlyFeaturesInView: true,
            mapBounds: bounds,
            aggregations: {},
        })
        expect(result.data.map((r) => r.id)).toEqual(['in'])
    })
})

describe('buildTableData - generic layer', () => {
    test('merges data and dataWithoutCoords, drops features with hasAdditionalGeometry, merges aggregations and stamps a row-order index', () => {
        const data = [feature('a', { name: 'A' })]
        const dataWithoutCoords = [
            feature('b', { name: 'B', hasAdditionalGeometry: true }),
            feature('c', { name: 'C' }),
        ]
        const result = buildTableData(THEMATIC_LAYER, {
            data,
            dataWithoutCoords,
            aggregations: { a: { count: 5 } },
        })
        expect(result.data).toEqual([
            { id: 'a', name: 'A', count: 5, index: 0 },
            { id: 'c', name: 'C', index: 1 },
        ])
    })
})

describe('buildTableData - tracked entity layer', () => {
    test('merges data and dataWithoutCoords, drops features with hasAdditionalGeometry, merges aggregations and stamps a row-order index', () => {
        const data = [feature('a', { w75KJ2mc4zz: 'Gabrielle' })]
        const dataWithoutCoords = [
            feature('b', {
                w75KJ2mc4zz: 'Hidden',
                hasAdditionalGeometry: true,
            }),
            feature('c', { w75KJ2mc4zz: 'Charlie' }),
        ]
        const result = buildTableData(TRACKED_ENTITY_LAYER, {
            data,
            dataWithoutCoords,
            aggregations: { a: { count: 5 } },
        })
        expect(result.data).toEqual([
            { id: 'a', w75KJ2mc4zz: 'Gabrielle', count: 5, index: 0 },
            { id: 'c', w75KJ2mc4zz: 'Charlie', index: 1 },
        ])
    })

    test('filters out-of-view features when showOnlyFeaturesInView is on', () => {
        const inBounds = feature('in', {}, [10, 10])
        const outOfBounds = feature('out', {}, [100, 100])
        const result = buildTableData(TRACKED_ENTITY_LAYER, {
            data: [inBounds, outOfBounds],
            showOnlyFeaturesInView: true,
            mapBounds: [0, 0, 20, 20],
            aggregations: {},
        })
        expect(result.data.map((r) => r.id)).toEqual(['in'])
    })
})

describe('buildTableData - styled event layer', () => {
    test('derives legend name and a formatted range from the matching legend item', () => {
        const data = [feature('a', { colorGroup: 0 })]
        const legend = {
            items: {
                0: { name: 'Low', startValue: 0, endValue: 10 },
            },
        }
        const result = buildTableData('event', {
            data,
            aggregations: {},
            isStyledEvent: true,
            legend,
            keyAnalysisDigitGroupSeparator: 'SPACE',
        })
        expect(result.data[0].legend).toBe('Low')
        expect(result.data[0].range).toBe('0 – 10')
    })

    test('leaves range undefined when the matched legend item has no start/end value', () => {
        const data = [feature('a', { colorGroup: 0 })]
        const legend = { items: { 0: { name: 'Uncategorized' } } }
        const result = buildTableData('event', {
            data,
            aggregations: {},
            isStyledEvent: true,
            legend,
        })
        expect(result.data[0].legend).toBe('Uncategorized')
        expect(result.data[0].range).toBeUndefined()
    })
})

describe('buildTableData - multi-period thematic layer', () => {
    const periods = [
        { id: 'p1', name: 'Jan' },
        { id: 'p2', name: 'Feb' },
    ]
    const valuesByPeriod = {
        p1: { a: { value: 1, color: '#f00', legend: 'Low', range: '0-1' } },
        p2: { a: { value: 2 } },
    }

    test('timeline: overlays the external period’s value/color/legend/range and adds one column per other period', () => {
        const data = [feature('a')]
        const result = buildTableData(THEMATIC_LAYER, {
            data,
            aggregations: {},
            isMultiPeriodThematic: true,
            isTimelineThematic: true,
            valuesByPeriod,
            externalPeriod: periods[0],
            periods,
        })
        expect(result.data[0]).toMatchObject({
            id: 'a',
            rawValue: 1,
            color: '#f00',
            legend: 'Low',
            range: '0-1',
            period_p2_rawValue: 2,
        })
        expect(result.data[0].period_p1_rawValue).toBeUndefined()
    })

    test('split (non-timeline): adds one column per period, with no current-period overlay', () => {
        const data = [feature('a')]
        const result = buildTableData(THEMATIC_LAYER, {
            data,
            aggregations: {},
            isMultiPeriodThematic: true,
            isTimelineThematic: false,
            valuesByPeriod,
            periods,
        })
        expect(result.data[0]).toMatchObject({
            id: 'a',
            period_p1_rawValue: 1,
            period_p2_rawValue: 2,
        })
        expect(result.data[0].rawValue).toBeUndefined()
    })

    test('falls back to null for a period with no recorded value for that org unit', () => {
        const data = [feature('a')]
        const result = buildTableData(THEMATIC_LAYER, {
            data,
            aggregations: {},
            isMultiPeriodThematic: true,
            isTimelineThematic: false,
            valuesByPeriod: { p1: {} },
            periods,
        })
        expect(result.data[0].period_p1_rawValue).toBeNull()
        expect(result.data[0].period_p2_rawValue).toBeNull()
    })
})
