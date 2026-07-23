import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../constants/layers.js'
import {
    ERROR_NON_HOMOGENOUS_FEATURES,
    getHeadersForLayer,
    TYPE_NUMBER,
    TYPE_STRING,
} from '../tableHeaders.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

const dataKeys = (result) => result.headers.map((h) => h.dataKey)

describe('getHeadersForLayer - thematic', () => {
    test('single-period: fixed fields plus legend/range/color', () => {
        const result = getHeadersForLayer(THEMATIC_LAYER, {
            isMultiPeriodThematic: false,
        })
        expect(dataKeys(result)).toEqual([
            'name',
            'id',
            'rawValue',
            'level',
            'parentName',
            'type',
            'legend',
            'range',
            'color',
        ])
    })

    test('multi-period, non-timeline: org unit headers plus one column per other period', () => {
        const periods = [
            { id: 'p1', name: 'Jan' },
            { id: 'p2', name: 'Feb' },
        ]
        const result = getHeadersForLayer(THEMATIC_LAYER, {
            isMultiPeriodThematic: true,
            isTimelineThematic: false,
            periods,
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining([
                'name',
                'id',
                'level',
                'parentName',
                'type',
                'period_p1_rawValue',
                'period_p2_rawValue',
            ])
        )
    })

    test('multi-period timeline: excludes the external period from the extra columns and labels value/legend/range/color with it', () => {
        const periods = [
            { id: 'p1', name: 'Jan' },
            { id: 'p2', name: 'Feb' },
        ]
        const externalPeriod = { id: 'p1', name: 'Jan' }
        const result = getHeadersForLayer(THEMATIC_LAYER, {
            isMultiPeriodThematic: true,
            isTimelineThematic: true,
            periods,
            externalPeriod,
        })
        expect(dataKeys(result)).not.toContain('period_p1_rawValue')
        expect(dataKeys(result)).toContain('period_p2_rawValue')
        const valueHeader = result.headers.find((h) => h.dataKey === 'rawValue')
        expect(valueHeader.name).toContain('Jan')
    })
})

describe('getHeadersForLayer - event', () => {
    test('fixed org unit/id/eventdate fields plus valid-uid custom fields from layerHeaders', () => {
        const layerHeaders = [
            {
                name: 'w75KJ2mc4zz',
                column: 'Age',
                valueType: 'INTEGER',
            },
            { name: 'not-a-uid', column: 'Ignored', valueType: 'TEXT' },
        ]
        const result = getHeadersForLayer(EVENT_LAYER, { layerHeaders })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['ouname', 'id', 'eventdate', 'w75KJ2mc4zz'])
        )
        expect(dataKeys(result)).not.toContain('not-a-uid')
        const ageHeader = result.headers.find(
            (h) => h.dataKey === 'w75KJ2mc4zz'
        )
        expect(ageHeader.type).toBe(TYPE_NUMBER)
    })

    test('adds the org unit boundary column only when countEventsOutsideOrgUnits is set', () => {
        const without = getHeadersForLayer(EVENT_LAYER, { layerHeaders: [] })
        const withBoundary = getHeadersForLayer(EVENT_LAYER, {
            layerHeaders: [],
            countEventsOutsideOrgUnits: true,
        })
        expect(dataKeys(without)).not.toContain('ouBoundary')
        expect(dataKeys(withBoundary)).toContain('ouBoundary')
    })

    test('adds legend/range/color only when styled by a data item', () => {
        const unstyled = getHeadersForLayer(EVENT_LAYER, { layerHeaders: [] })
        const styled = getHeadersForLayer(EVENT_LAYER, {
            layerHeaders: [],
            styleDataItem: { id: 'abc' },
        })
        expect(dataKeys(unstyled)).not.toContain('color')
        expect(dataKeys(styled)).toEqual(
            expect.arrayContaining(['legend', 'range', 'color'])
        )
    })
})

describe('getHeadersForLayer - org unit / facility', () => {
    test('org unit: fixed fields plus whichever style columns the data actually has', () => {
        const result = getHeadersForLayer(ORG_UNIT_LAYER, {
            data: [{ color: '#fff' }, { iconUrl: 'x.png' }],
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining([
                'name',
                'id',
                'level',
                'parentName',
                'type',
                'color',
                'iconUrl',
            ])
        )
        expect(dataKeys(result)).not.toContain('group')
    })

    test('facility: same style-detection behavior as org unit, with a smaller fixed field set', () => {
        const result = getHeadersForLayer(FACILITY_LAYER, {
            data: [{ group: 'g1' }],
        })
        expect(dataKeys(result)).toEqual(['name', 'id', 'type', 'group'])
    })
})

describe('getHeadersForLayer - tracked entity', () => {
    test('id field plus valid-uid custom fields from layerHeaders, always with a color column', () => {
        const layerHeaders = [
            { name: 'First name', dataKey: 'w75KJ2mc4zz', valueType: 'TEXT' },
            { name: 'Bad', dataKey: 'not-a-uid', valueType: 'TEXT' },
        ]
        const result = getHeadersForLayer(TRACKED_ENTITY_LAYER, {
            layerHeaders,
        })
        expect(dataKeys(result)).toEqual(['id', 'w75KJ2mc4zz', 'color'])
        const nameHeader = result.headers.find(
            (h) => h.dataKey === 'w75KJ2mc4zz'
        )
        expect(nameHeader.type).toBe(TYPE_STRING)
    })
})

describe('getHeadersForLayer - earth engine', () => {
    test('class-based aggregation: one column per legend item, rounded to 2 decimal places', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: 'percentage',
            legend: {
                title: 'Land cover',
                items: [{ value: 1, name: 'Forest' }],
            },
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['name', 'id', 'type', '1'])
        )
        const classHeader = result.headers.find((h) => h.dataKey === '1')
        expect(classHeader.name).toBe('Forest')
        expect(classHeader.roundFn(1.23456)).toBe(1.23)
    })

    test('non-class aggregation array: one title-cased column per aggregation type', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['mean'],
            legend: { title: 'Rainfall', items: [] },
            data: [{ mean: 12.3456 }],
        })
        const meanHeader = result.headers.find((h) => h.dataKey === 'mean')
        expect(meanHeader.name).toBe('Mean Rainfall')
        expect(meanHeader.type).toBe(TYPE_NUMBER)
    })
})

describe('getHeadersForLayer - geoJsonUrl', () => {
    test('homogenous features: derives headers from the first feature', () => {
        const rawData = [
            {
                geometry: { type: 'Point' },
                properties: { name: 'A', color: '#f00' },
            },
            {
                geometry: { type: 'Point' },
                properties: { name: 'B', color: '#0f0' },
            },
        ]
        const result = getHeadersForLayer(GEOJSON_URL_LAYER, { rawData })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['name', 'color'])
        )
    })

    test('non-homogenous geometry types: returns an error code instead of headers', () => {
        const rawData = [
            { geometry: { type: 'Point' }, properties: {} },
            { geometry: { type: 'LineString' }, properties: {} },
        ]
        const result = getHeadersForLayer(GEOJSON_URL_LAYER, { rawData })
        expect(result).toEqual({ errorCode: ERROR_NON_HOMOGENOUS_FEATURES })
    })

    test('a Polygon/MultiPolygon mix is homogenous (matches the loader’s own Multi-normalization)', () => {
        const rawData = [
            { geometry: { type: 'Polygon' }, properties: { name: 'A' } },
            { geometry: { type: 'MultiPolygon' }, properties: { name: 'B' } },
        ]
        const result = getHeadersForLayer(GEOJSON_URL_LAYER, { rawData })
        expect(result.errorCode).toBeUndefined()
        expect(dataKeys(result)).toEqual(expect.arrayContaining(['name']))
    })
})

describe('getHeadersForLayer - unknown layer type', () => {
    test('returns null headers rather than throwing', () => {
        expect(getHeadersForLayer('somethingElse', {})).toEqual({
            headers: null,
        })
    })
})
