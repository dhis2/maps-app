import {
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_BOOLEAN,
} from '../../constants/dataTable.js'
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
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_TIME,
} from '../tableHeaders.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

const dataKeys = (result) => result.headers.map((h) => h.dataKey)
const defaultHiddenKeys = (result) =>
    result.headers.filter((h) => h.defaultHidden).map((h) => h.dataKey)

describe('getHeadersForLayer - defaultHidden', () => {
    test('Id, Org unit id, Org unit level, and Geometry type are hidden by default; Org unit and Org unit hierarchy are not', () => {
        const result = getHeadersForLayer(THEMATIC_LAYER, {
            isMultiPeriodThematic: false,
        })
        expect(defaultHiddenKeys(result)).toEqual(
            expect.arrayContaining(['id', 'level', 'type'])
        )
        expect(defaultHiddenKeys(result)).not.toEqual(
            expect.arrayContaining(['orgUnitOwn', 'orgUnitPath'])
        )
    })
})

describe('getHeadersForLayer - thematic', () => {
    test('single-period: fixed fields plus legend/range/color', () => {
        const result = getHeadersForLayer(THEMATIC_LAYER, {
            isMultiPeriodThematic: false,
        })
        expect(dataKeys(result)).toEqual([
            'id',
            'orgUnitOwn',
            'level',
            'orgUnitPath',
            'rawValue',
            'legend',
            'range',
            'color',
            'type',
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
                'id',
                'orgUnitOwn',
                'orgUnitPath',
                'level',
                'type',
                'period_p1_rawValue',
                'period_p2_rawValue',
            ])
        )
    })

    test('multi-period timeline: keeps a fixed column for the external period alongside the current-period columns, and labels value/legend/range/color with it', () => {
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
        expect(dataKeys(result)).toContain('period_p1_rawValue')
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
            expect.arrayContaining([
                'id',
                'orgUnitId',
                'orgUnitOwn',
                'eventdate',
                'orgUnitPath',
                'w75KJ2mc4zz',
            ])
        )
        expect(dataKeys(result)).not.toContain('not-a-uid')
        const ageHeader = result.headers.find(
            (h) => h.dataKey === 'w75KJ2mc4zz'
        )
        expect(ageHeader.type).toBe(TYPE_NUMBER)
        const eventdateHeader = result.headers.find(
            (h) => h.dataKey === 'eventdate'
        )
        expect(eventdateHeader.type).toBe(TYPE_DATE)
    })

    test('custom DATE/DATETIME/TIME/AGE fields get their matching type, option-set-backed fields stay TYPE_STRING', () => {
        const layerHeaders = [
            { name: 'w75KJ2mc4zz', column: 'Date of birth', valueType: 'DATE' },
            {
                name: 'zDhUuAYrxNC',
                column: 'Registered at',
                valueType: 'DATETIME',
            },
            { name: 'oZg33kd9taw', column: 'Visit time', valueType: 'TIME' },
            { name: 'a1b2c3d4e5f', column: 'Age', valueType: 'AGE' },
            {
                name: 'b2c3d4e5f6a',
                column: 'Gender',
                valueType: 'TEXT',
                optionSet: { id: 'os1' },
            },
            {
                name: 'c3d4e5f6a7b',
                column: 'Referred by facility',
                valueType: 'ORGANISATION_UNIT',
            },
            {
                name: 'd4e5f6a7b8c',
                column: 'Follow-up',
                valueType: 'BOOLEAN',
            },
        ]
        const result = getHeadersForLayer(EVENT_LAYER, { layerHeaders })
        const headerFor = (dataKey) =>
            result.headers.find((h) => h.dataKey === dataKey)
        const typeOf = (dataKey) => headerFor(dataKey).type
        expect(typeOf('w75KJ2mc4zz')).toBe(TYPE_DATE)
        expect(typeOf('zDhUuAYrxNC')).toBe(TYPE_DATETIME)
        expect(typeOf('oZg33kd9taw')).toBe(TYPE_TIME)
        expect(typeOf('a1b2c3d4e5f')).toBe(TYPE_DATE)
        expect(typeOf('b2c3d4e5f6a')).toBe(TYPE_STRING)
        expect(typeOf('c3d4e5f6a7b')).toBe(TYPE_STRING)
        expect(typeOf('d4e5f6a7b8c')).toBe(TYPE_STRING)
        expect(headerFor('w75KJ2mc4zz').renderer).toBe(RENDERER_DATE)
        expect(headerFor('zDhUuAYrxNC').renderer).toBe(RENDERER_DATE)
        expect(headerFor('oZg33kd9taw').renderer).toBe(RENDERER_DATE)
        expect(headerFor('a1b2c3d4e5f').renderer).toBe(RENDERER_DATE)
        expect(headerFor('b2c3d4e5f6a').renderer).toBeUndefined()
        expect(headerFor('c3d4e5f6a7b').renderer).toBe(RENDERER_ORG_UNIT)
        expect(headerFor('d4e5f6a7b8c').renderer).toBe(RENDERER_BOOLEAN)
    })

    test('option-set-backed custom field carries the optionSet id onto the header', () => {
        const layerHeaders = [
            {
                name: 'b2c3d4e5f6a',
                column: 'Gender',
                valueType: 'TEXT',
                optionSet: { id: 'os1' },
            },
        ]
        const result = getHeadersForLayer(EVENT_LAYER, { layerHeaders })
        const header = result.headers.find((h) => h.dataKey === 'b2c3d4e5f6a')
        expect(header.optionSet).toEqual({ id: 'os1' })
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

    test('does not duplicate the fixed "Last updated" column when the analytics response happens to include a same-named header ("lastupdated" coincidentally matches the 11-char isValidUid shape)', () => {
        const layerHeaders = [
            {
                name: 'lastupdated',
                column: 'Last updated on',
                valueType: 'DATE',
            },
        ]
        const result = getHeadersForLayer(EVENT_LAYER, { layerHeaders })
        const lastUpdatedHeaders = result.headers.filter(
            (h) => h.dataKey === 'lastupdated'
        )
        expect(lastUpdatedHeaders).toHaveLength(1)
        expect(lastUpdatedHeaders[0]).toMatchObject({
            name: 'Last updated',
            type: TYPE_DATETIME,
        })
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
                'id',
                'orgUnitOwn',
                'level',
                'type',
                'orgUnitPath',
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
        expect(dataKeys(result)).toEqual([
            'id',
            'orgUnitOwn',
            'level',
            'orgUnitPath',
            'group',
            'type',
        ])
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
        expect(dataKeys(result)).toEqual([
            'id',
            'orgUnitId',
            'orgUnitOwn',
            'level',
            'orgUnitPath',
            'createdAt',
            'updatedAt',
            'w75KJ2mc4zz',
            'color',
            'type',
        ])
        const nameHeader = result.headers.find(
            (h) => h.dataKey === 'w75KJ2mc4zz'
        )
        expect(nameHeader.type).toBe(TYPE_STRING)
        const createdHeader = result.headers.find(
            (h) => h.dataKey === 'createdAt'
        )
        expect(createdHeader.type).toBe(TYPE_DATETIME)
        expect(createdHeader.renderer).toBe(RENDERER_DATE)
        const updatedHeader = result.headers.find(
            (h) => h.dataKey === 'updatedAt'
        )
        expect(updatedHeader.type).toBe(TYPE_DATETIME)
        expect(updatedHeader.renderer).toBe(RENDERER_DATE)
    })

    test('custom DATE/DATETIME/TIME/BOOLEAN attributes get their matching type', () => {
        const layerHeaders = [
            {
                name: 'Date of birth',
                dataKey: 'w75KJ2mc4zz',
                valueType: 'DATE',
            },
            {
                name: 'Enrolled at',
                dataKey: 'zDhUuAYrxNC',
                valueType: 'DATETIME',
            },
            { name: 'Visit time', dataKey: 'oZg33kd9taw', valueType: 'TIME' },
            {
                name: 'Referred by facility',
                dataKey: 'c3d4e5f6a7b',
                valueType: 'ORGANISATION_UNIT',
            },
            {
                name: 'Follow-up',
                dataKey: 'd4e5f6a7b8c',
                valueType: 'BOOLEAN',
            },
        ]
        const result = getHeadersForLayer(TRACKED_ENTITY_LAYER, {
            layerHeaders,
        })
        const headerFor = (dataKey) =>
            result.headers.find((h) => h.dataKey === dataKey)
        const typeOf = (dataKey) => headerFor(dataKey).type
        expect(typeOf('w75KJ2mc4zz')).toBe(TYPE_DATE)
        expect(typeOf('zDhUuAYrxNC')).toBe(TYPE_DATETIME)
        expect(typeOf('oZg33kd9taw')).toBe(TYPE_TIME)
        expect(typeOf('c3d4e5f6a7b')).toBe(TYPE_STRING)
        expect(typeOf('d4e5f6a7b8c')).toBe(TYPE_STRING)
        expect(headerFor('w75KJ2mc4zz').renderer).toBe(RENDERER_DATE)
        expect(headerFor('zDhUuAYrxNC').renderer).toBe(RENDERER_DATE)
        expect(headerFor('oZg33kd9taw').renderer).toBe(RENDERER_DATE)
        expect(headerFor('c3d4e5f6a7b').renderer).toBe(RENDERER_ORG_UNIT)
        expect(headerFor('d4e5f6a7b8c').renderer).toBe(RENDERER_BOOLEAN)
    })

    test('option-set-backed custom attribute carries the optionSet id onto the header (was silently dropped before)', () => {
        const layerHeaders = [
            {
                name: 'Gender',
                dataKey: 'b2c3d4e5f6a',
                valueType: 'TEXT',
                optionSet: { id: 'os1' },
            },
        ]
        const result = getHeadersForLayer(TRACKED_ENTITY_LAYER, {
            layerHeaders,
        })
        const header = result.headers.find((h) => h.dataKey === 'b2c3d4e5f6a')
        expect(header.optionSet).toEqual({ id: 'os1' })
        expect(header.type).toBe(TYPE_STRING)
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
            expect.arrayContaining([
                'id',
                'orgUnitOwn',
                'orgUnitPath',
                'type',
                '1',
            ])
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

    // Real band ids/names from src/constants/earthEngineLayers/population_age_sex_Worldpop-Global2.js
    const populationBands = {
        multiple: true,
        list: [
            { id: 'm_00', name: 'Male 0 - 1 years' },
            { id: 'f_00', name: 'Female 0 - 1 years' },
        ],
    }

    test('only 1 band selected: no per-band columns, even with a multi-stat bands.multiple layer', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['sum', 'mean'],
            legend: { title: 'Population', items: [] },
            bands: populationBands,
            band: ['m_00'],
            data: [{ sum: 100, mean: 10 }],
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['sum', 'mean'])
        )
        expect(dataKeys(result)).not.toEqual(
            expect.arrayContaining(['m_00', 'm_00_sum'])
        )
    })

    test('2+ bands, exactly 1 stat: one bare-band-id column per band, hidden by default', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['sum'],
            legend: { title: 'Population', items: [] },
            bands: populationBands,
            band: ['m_00', 'f_00'],
            data: [{ sum: 100, m_00: 60, f_00: 40 }],
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['sum', 'm_00', 'f_00'])
        )
        const maleHeader = result.headers.find((h) => h.dataKey === 'm_00')
        expect(maleHeader.name).toBe('Male 0 - 1 years')
        expect(maleHeader.defaultHidden).toBe(true)
        expect(maleHeader.type).toBe(TYPE_NUMBER)
    })

    test('band columns get a null roundFn (not a rounds-to-whole-numbers function) before any data has loaded', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['sum'],
            legend: { title: 'Population', items: [] },
            bands: populationBands,
            band: ['m_00', 'f_00'],
            data: undefined,
        })
        const maleHeader = result.headers.find((h) => h.dataKey === 'm_00')
        expect(maleHeader.roundFn).toBe(null)
    })

    test('2+ bands, 2+ stats: one title-cased ${band}_${type} column per band per stat, hidden by default', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['sum', 'mean'],
            legend: { title: 'Population', items: [] },
            bands: populationBands,
            band: ['m_00', 'f_00'],
            data: [{ sum: 100, mean: 10, m_00_sum: 60, m_00_mean: 6 }],
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining([
                'sum',
                'mean',
                'm_00_sum',
                'm_00_mean',
                'f_00_sum',
                'f_00_mean',
            ])
        )
        const header = result.headers.find((h) => h.dataKey === 'm_00_sum')
        expect(header.name).toBe('Sum Male 0 - 1 Years')
        expect(header.defaultHidden).toBe(true)
        expect(header.roundFn(6.7891234)).toBe(6.789)
    })

    test('no bands config at all: unaffected, same as an ordinary non-multi-band EE layer', () => {
        const result = getHeadersForLayer(EARTH_ENGINE_LAYER, {
            aggregationType: ['sum', 'mean'],
            legend: { title: 'NDVI', items: [] },
            data: [{ sum: 100, mean: 10 }],
        })
        expect(dataKeys(result)).toEqual(
            expect.arrayContaining(['sum', 'mean'])
        )
        expect(result.headers).toHaveLength(7)
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
