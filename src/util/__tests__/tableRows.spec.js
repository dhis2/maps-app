import { GEOJSON_URL_LAYER, THEMATIC_LAYER } from '../../constants/layers.js'
import { buildTableData, ERROR_NO_VALID_DATA } from '../tableRows.js'

const feature = (id, extraProperties = {}) => ({
    id,
    geometry: { type: 'Point', coordinates: [10, 10] },
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

describe('buildTableData - multi-period thematic layer', () => {
    const periods = [
        { id: 'p1', name: 'Jan' },
        { id: 'p2', name: 'Feb' },
    ]
    const valuesByPeriod = {
        p1: {
            a: {
                value: 1,
                rawValue: 1,
                color: '#f00',
                legend: 'Low',
                range: '0-1',
            },
        },
        p2: { a: { value: 2 } },
    }

    test('timeline: overlays the external period’s value/color/legend/range and adds one column per period, the current one included', () => {
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
            period_p1_rawValue: 1,
            period_p2_rawValue: 2,
        })
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
