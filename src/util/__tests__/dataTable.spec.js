import {
    DATA_KEY_KIND_CATEGORY,
    DATA_KEY_KIND_COUNT,
    DATA_KEY_KIND_VALUE,
} from '../../constants/dataTable.js'
import {
    EARTH_ENGINE_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    FACILITY_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    EXTERNAL_LAYER,
} from '../../constants/layers.js'
import {
    buildFeatureIndex,
    getCombinedLegendConfig,
    getCombinedValueDataKeys,
    getDefaultCombinedAggregation,
    getDefaultReferenceRows,
    getEligibleDataTableLayers,
    getFeatureCategoryKey,
    getLayerSelectedIds,
    getNextSorting,
    getPanelHeights,
    getRowClickAction,
    getRowId,
    getUnionBounds,
    hasActiveDataTableFilters,
    isDataTableOpen,
    isFilterable,
    mergeCrossLayerIds,
    shouldClearFeatureHighlight,
} from '../dataTable.js'

const withDataItem = (aggregationType) => ({
    layer: THEMATIC_LAYER,
    columns: [
        {
            dimension: 'dx',
            items: [{ id: 'de1', name: 'DE 1', aggregationType }],
        },
    ],
})

describe('getCombinedValueDataKeys', () => {
    test('returns a single generic rawValue column for any non-Earth-Engine layer', () => {
        expect(getCombinedValueDataKeys({ layer: THEMATIC_LAYER })).toEqual([
            { dataKey: 'rawValue', name: null, kind: DATA_KEY_KIND_VALUE },
        ])
    })

    test('single-period thematic layer (no renderingStrategy set) still returns the single generic rawValue column', () => {
        expect(
            getCombinedValueDataKeys({
                layer: THEMATIC_LAYER,
                renderingStrategy: 'SINGLE',
            })
        ).toEqual([
            { dataKey: 'rawValue', name: null, kind: DATA_KEY_KIND_VALUE },
        ])
    })

    test('TIMELINE thematic layer: returns a current column plus one fixed column per period', () => {
        const externalPeriod = { id: 'p1', name: 'Jan' }
        const periods = [
            { id: 'p1', name: 'Jan' },
            { id: 'p2', name: 'Feb' },
        ]
        expect(
            getCombinedValueDataKeys(
                {
                    layer: THEMATIC_LAYER,
                    renderingStrategy: 'TIMELINE',
                    periods,
                },
                externalPeriod
            )
        ).toEqual([
            {
                dataKey: 'rawValue',
                name: null,
                kind: DATA_KEY_KIND_VALUE,
                periodId: 'p1',
                periodName: 'Jan',
                isCurrentPeriod: true,
                settingsKey: 'rawValue',
            },
            {
                dataKey: 'period_p1_rawValue',
                name: null,
                kind: DATA_KEY_KIND_VALUE,
                periodId: 'p1',
                periodName: 'Jan',
                settingsKey: 'rawValue',
                defaultHidden: true,
            },
            {
                dataKey: 'period_p2_rawValue',
                name: null,
                kind: DATA_KEY_KIND_VALUE,
                periodId: 'p2',
                periodName: 'Feb',
                settingsKey: 'rawValue',
                defaultHidden: true,
            },
        ])
    })

    test('SPLIT_BY_PERIOD thematic layer: returns only fixed per-period columns, no current column', () => {
        const periods = [{ id: 'p1', name: 'Jan' }]
        expect(
            getCombinedValueDataKeys({
                layer: THEMATIC_LAYER,
                renderingStrategy: 'SPLIT_BY_PERIOD',
                periods,
            })
        ).toEqual([
            {
                dataKey: 'period_p1_rawValue',
                name: null,
                kind: DATA_KEY_KIND_VALUE,
                periodId: 'p1',
                periodName: 'Jan',
                settingsKey: 'rawValue',
                defaultHidden: true,
            },
        ])
    })

    test('returns one column per aggregation stat when aggregationType is an array', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['mean', 'max'],
                legend: { title: 'NDVI' },
            })
        ).toEqual([
            { dataKey: 'mean', name: 'Mean Ndvi', kind: DATA_KEY_KIND_VALUE },
            { dataKey: 'max', name: 'Max Ndvi', kind: DATA_KEY_KIND_VALUE },
        ])
    })

    test('returns one column per legend class when aggregationType is classified', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'percentage',
                legend: {
                    items: [
                        { value: 1, name: 'Forest' },
                        { value: 2, name: 'Water' },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '1', name: 'Forest', kind: DATA_KEY_KIND_VALUE },
            { dataKey: '2', name: 'Water', kind: DATA_KEY_KIND_VALUE },
        ])
    })

    test('returns no columns for an Earth Engine layer with neither shape configured yet', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: null,
                legend: {},
            })
        ).toEqual([])
    })

    // Real band ids/names from src/constants/earthEngineLayers/population_age_sex_Worldpop-Global2.js
    const populationBands = {
        multiple: true,
        list: [
            { id: 'm_00', name: 'Male 0 - 1 years' },
            { id: 'f_00', name: 'Female 0 - 1 years' },
        ],
    }

    test('only 1 band selected: no extra band columns', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['sum', 'mean'],
                legend: { title: 'Population' },
                bands: populationBands,
                band: ['m_00'],
            })
        ).toEqual([
            {
                dataKey: 'sum',
                name: 'Sum Population',
                kind: DATA_KEY_KIND_VALUE,
            },
            {
                dataKey: 'mean',
                name: 'Mean Population',
                kind: DATA_KEY_KIND_VALUE,
            },
        ])
    })

    test('2+ bands, exactly 1 stat: one bare-band-id column per band, hidden by default', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['sum'],
                legend: { title: 'Population' },
                bands: populationBands,
                band: ['m_00', 'f_00'],
            })
        ).toEqual([
            {
                dataKey: 'sum',
                name: 'Sum Population',
                kind: DATA_KEY_KIND_VALUE,
            },
            {
                dataKey: 'm_00',
                name: 'Male 0 - 1 years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
            {
                dataKey: 'f_00',
                name: 'Female 0 - 1 years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
        ])
    })

    test('2+ bands, 2+ stats: one title-cased ${band}_${type} column per band per stat, hidden by default', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['sum', 'mean'],
                legend: { title: 'Population' },
                bands: populationBands,
                band: ['m_00', 'f_00'],
            })
        ).toEqual([
            {
                dataKey: 'sum',
                name: 'Sum Population',
                kind: DATA_KEY_KIND_VALUE,
            },
            {
                dataKey: 'mean',
                name: 'Mean Population',
                kind: DATA_KEY_KIND_VALUE,
            },
            {
                dataKey: 'm_00_sum',
                name: 'Sum Male 0 - 1 Years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
            {
                dataKey: 'm_00_mean',
                name: 'Mean Male 0 - 1 Years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
            {
                dataKey: 'f_00_sum',
                name: 'Sum Female 0 - 1 Years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
            {
                dataKey: 'f_00_mean',
                name: 'Mean Female 0 - 1 Years',
                kind: DATA_KEY_KIND_VALUE,
                defaultHidden: true,
            },
        ])
    })

    test('no bands config at all: unaffected, same as an ordinary non-multi-band EE layer', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['mean', 'max'],
                legend: { title: 'NDVI' },
            })
        ).toEqual([
            { dataKey: 'mean', name: 'Mean Ndvi', kind: DATA_KEY_KIND_VALUE },
            { dataKey: 'max', name: 'Max Ndvi', kind: DATA_KEY_KIND_VALUE },
        ])
    })

    describe('Facility/OrgUnit group-set categorical columns', () => {
        const groupedLayer = (layer, items) => ({
            layer,
            organisationUnitGroupSet: { id: 'groupSet1' },
            legend: { items },
        })

        test('grouped Facility with 2+ groups: one category column per group, keyed by id', () => {
            expect(
                getCombinedValueDataKeys(
                    groupedLayer(FACILITY_LAYER, [
                        { id: 'group1', name: 'Hospital' },
                        { id: 'group2', name: 'Clinic' },
                    ])
                )
            ).toEqual([
                {
                    dataKey: 'group1',
                    name: 'Hospital',
                    kind: DATA_KEY_KIND_CATEGORY,
                },
                {
                    dataKey: 'group2',
                    name: 'Clinic',
                    kind: DATA_KEY_KIND_CATEGORY,
                },
            ])
        })

        test('grouped OrgUnit with an Unclassified item present: keyed as the unclassified sentinel', () => {
            expect(
                getCombinedValueDataKeys(
                    groupedLayer(ORG_UNIT_LAYER, [
                        { id: 'group1', name: 'Hospital' },
                        { name: 'Unclassified' },
                    ])
                )
            ).toEqual([
                {
                    dataKey: 'group1',
                    name: 'Hospital',
                    kind: DATA_KEY_KIND_CATEGORY,
                },
                {
                    dataKey: 'unclassified',
                    name: 'Unclassified',
                    kind: DATA_KEY_KIND_CATEGORY,
                },
            ])
        })

        test('grouped with exactly 1 group: falls back to count-only', () => {
            expect(
                getCombinedValueDataKeys(
                    groupedLayer(FACILITY_LAYER, [
                        { id: 'group1', name: 'Hospital' },
                    ])
                )
            ).toEqual([
                { dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT },
            ])
        })

        test('ungrouped Facility: count-only', () => {
            expect(
                getCombinedValueDataKeys({
                    layer: FACILITY_LAYER,
                    legend: { items: [{ name: 'Facility' }] },
                })
            ).toEqual([
                { dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT },
            ])
        })

        test('ungrouped OrgUnit with a level-fallback legend (items.length > 1, no group set): count-only, not one column per level', () => {
            expect(
                getCombinedValueDataKeys({
                    layer: ORG_UNIT_LAYER,
                    legend: {
                        items: [
                            { name: 'Level 1' },
                            { name: 'Level 2' },
                            { name: 'Level 3' },
                        ],
                    },
                })
            ).toEqual([
                { dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT },
            ])
        })
    })
})

describe('getCombinedLegendConfig', () => {
    test('Earth Engine layer: no legend column', () => {
        expect(
            getCombinedLegendConfig({ layer: EARTH_ENGINE_LAYER })
        ).toBeNull()
    })

    test('single-period thematic layer: generic legend, read straight off feature properties', () => {
        expect(
            getCombinedLegendConfig({
                layer: THEMATIC_LAYER,
                renderingStrategy: 'SINGLE',
            })
        ).toEqual({ periodId: null, periodName: null, isCurrentPeriod: false })
    })

    test('non-thematic layer: generic legend, unaffected by renderingStrategy', () => {
        expect(getCombinedLegendConfig({ layer: FACILITY_LAYER })).toEqual({
            periodId: null,
            periodName: null,
            isCurrentPeriod: false,
        })
    })

    test('TIMELINE thematic layer: legend resolved from the current period', () => {
        const externalPeriod = { id: 'p1', name: 'Jan' }
        expect(
            getCombinedLegendConfig(
                { layer: THEMATIC_LAYER, renderingStrategy: 'TIMELINE' },
                externalPeriod
            )
        ).toEqual({ periodId: 'p1', periodName: 'Jan', isCurrentPeriod: true })
    })

    test('SPLIT_BY_PERIOD thematic layer: no legend column at all', () => {
        expect(
            getCombinedLegendConfig({
                layer: THEMATIC_LAYER,
                renderingStrategy: 'SPLIT_BY_PERIOD',
            })
        ).toBeNull()
    })
})

describe('getFeatureCategoryKey - Facility/OrgUnit', () => {
    const layer = {
        layer: FACILITY_LAYER,
        organisationUnitGroupSet: { id: 'groupSet1' },
    }

    test("returns the feature's own group id for the layer's group set dimension", () => {
        expect(
            getFeatureCategoryKey(layer, {
                dimensions: { groupSet1: 'group1' },
            })
        ).toBe('group1')
    })

    test('returns the unclassified sentinel when the feature has no value for that dimension', () => {
        expect(getFeatureCategoryKey(layer, { dimensions: {} })).toBe(
            'unclassified'
        )
        expect(getFeatureCategoryKey(layer, {})).toBe('unclassified')
    })
})

describe('getCombinedValueDataKeys - Event layers', () => {
    test('no styleDataItem: count-only', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                legend: { items: [{ name: 'Event', colorGroup: 0 }] },
            })
        ).toEqual([{ dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT }])
    })

    test('styleDataItem on a numeric value type: single value-kind entry, even when its own legend has 2+ classification bins', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', valueType: 'NUMBER' },
                legend: {
                    items: [
                        { name: 'Low', colorGroup: 0 },
                        { name: 'High', colorGroup: 1 },
                    ],
                },
            })
        ).toEqual([{ dataKey: 'value', name: null, kind: DATA_KEY_KIND_VALUE }])
    })

    test('styleDataItem.optionSet with 3 options: 3 category entries keyed by colorGroup', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', optionSet: { id: 'os1' } },
                legend: {
                    items: [
                        { name: 'Option A', colorGroup: 0 },
                        { name: 'Option B', colorGroup: 1 },
                        { name: 'Option C', colorGroup: 2 },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '0', name: 'Option A', kind: DATA_KEY_KIND_CATEGORY },
            { dataKey: '1', name: 'Option B', kind: DATA_KEY_KIND_CATEGORY },
            { dataKey: '2', name: 'Option C', kind: DATA_KEY_KIND_CATEGORY },
        ])
    })

    test('boolean styleDataItem (Yes/No): 2 category entries', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', valueType: 'BOOLEAN' },
                legend: {
                    items: [
                        { name: 'Yes', colorGroup: 0 },
                        { name: 'No', colorGroup: 1 },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '0', name: 'Yes', kind: DATA_KEY_KIND_CATEGORY },
            { dataKey: '1', name: 'No', kind: DATA_KEY_KIND_CATEGORY },
        ])
    })

    test('optionSet + Unclassified/No data legends configured: extra category entries keyed by their own colorGroup, not by name', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', optionSet: { id: 'os1' } },
                legend: {
                    items: [
                        { name: 'Option A', colorGroup: 0 },
                        { name: 'Unclassified', colorGroup: 1 },
                        { name: 'No data', colorGroup: 2 },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '0', name: 'Option A', kind: DATA_KEY_KIND_CATEGORY },
            {
                dataKey: '1',
                name: 'Unclassified',
                kind: DATA_KEY_KIND_CATEGORY,
            },
            { dataKey: '2', name: 'No data', kind: DATA_KEY_KIND_CATEGORY },
        ])
    })

    test('styleDataItem on a TEXT value type with No data legend configured (2-item legend): 2 category columns, not count-only (resolved carve-out)', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', valueType: 'TEXT' },
                legend: {
                    items: [
                        { name: 'Event', colorGroup: 0 },
                        { name: 'No data', colorGroup: 1 },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '0', name: 'Event', kind: DATA_KEY_KIND_CATEGORY },
            { dataKey: '1', name: 'No data', kind: DATA_KEY_KIND_CATEGORY },
        ])
    })

    test('styleDataItem on a TEXT value type with no No data legend (1-item legend): count-only', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', valueType: 'TEXT' },
                legend: { items: [{ name: 'Event', colorGroup: 0 }] },
            })
        ).toEqual([{ dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT }])
    })

    test('single-option optionSet: falls back to count-only', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', optionSet: { id: 'os1' } },
                legend: { items: [{ name: 'Option A', colorGroup: 0 }] },
            })
        ).toEqual([{ dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT }])
    })
})

describe('getFeatureCategoryKey - Event', () => {
    const layer = { layer: EVENT_LAYER }

    test("returns the feature's own colorGroup, stringified", () => {
        expect(getFeatureCategoryKey(layer, { colorGroup: 1 })).toBe('1')
    })
})

describe('getCombinedValueDataKeys - TrackedEntity layers', () => {
    test('always count-only, regardless of legend shape (TE has no classification support today)', () => {
        expect(
            getCombinedValueDataKeys({
                layer: TRACKED_ENTITY_LAYER,
                legend: { items: [{ name: 'Person' }] },
            })
        ).toEqual([{ dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT }])
    })

    test('still count-only even given a multi-item legend, defending against future drift', () => {
        expect(
            getCombinedValueDataKeys({
                layer: TRACKED_ENTITY_LAYER,
                legend: { items: [{ name: 'Type A' }, { name: 'Type B' }] },
            })
        ).toEqual([{ dataKey: 'count', name: null, kind: DATA_KEY_KIND_COUNT }])
    })
})

describe('getDefaultCombinedAggregation', () => {
    test("defaults to the data item's own aggregation type", () => {
        expect(getDefaultCombinedAggregation(withDataItem('AVERAGE'))).toEqual({
            rawValue: 'AVERAGE',
        })
    })

    test('maps AVERAGE_SUM_ORG_UNIT to SUM', () => {
        expect(
            getDefaultCombinedAggregation(withDataItem('AVERAGE_SUM_ORG_UNIT'))
        ).toEqual({ rawValue: 'SUM' })
    })

    test('falls back to SUM when the data item has no aggregationType', () => {
        expect(getDefaultCombinedAggregation(withDataItem(undefined))).toEqual({
            rawValue: 'SUM',
        })
    })

    test('falls back to SUM for a layer with no data item at all (non-Thematic types)', () => {
        expect(
            getDefaultCombinedAggregation({ layer: EARTH_ENGINE_LAYER })
        ).toEqual({})
    })

    test('defaults a plain Indicator data item to AVERAGE - it has no aggregationType of its own, and its value is a ratio not meaningfully summed across org units', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: THEMATIC_LAYER,
                columns: [
                    {
                        dimension: 'dx',
                        items: [
                            {
                                id: 'in1',
                                name: 'Indicator 1',
                                dimensionItemType: 'INDICATOR',
                            },
                        ],
                    },
                ],
            })
        ).toEqual({ rawValue: 'AVERAGE' })
    })

    test("Earth Engine: defaults every stat column to the first selected stat's own equivalent", () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['mean', 'max'],
                legend: { title: 'NDVI' },
            })
        ).toEqual({ mean: 'AVERAGE', max: 'AVERAGE' })
    })

    test('Earth Engine: classified percentage (e.g. Landcover) defaults to AVERAGE - a relative proportion is not meaningfully summed across differently-sized org units', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'percentage',
                legend: { items: [{ value: 1, name: 'Forest' }] },
            })
        ).toEqual({ 1: 'AVERAGE' })
    })

    test('Earth Engine: classified hectares/acres default to SUM - an absolute area is correctly additive across joined org units', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'hectares',
                legend: { items: [{ value: 1, name: 'Forest' }] },
            })
        ).toEqual({ 1: 'SUM' })
        expect(
            getDefaultCombinedAggregation({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'acres',
                legend: { items: [{ value: 1, name: 'Forest' }] },
            })
        ).toEqual({ 1: 'SUM' })
    })

    test('Earth Engine: per-band columns pick up the same default aggregation type as the main stat columns, with no extra mapping needed', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['sum', 'mean'],
                legend: { title: 'Population' },
                bands: {
                    multiple: true,
                    list: [
                        { id: 'm_00', name: 'Male 0 - 1 years' },
                        { id: 'f_00', name: 'Female 0 - 1 years' },
                    ],
                },
                band: ['m_00', 'f_00'],
            })
        ).toEqual({
            sum: 'SUM',
            mean: 'SUM',
            m_00_sum: 'SUM',
            m_00_mean: 'SUM',
            f_00_sum: 'SUM',
            f_00_mean: 'SUM',
        })
    })

    test('Facility/OrgUnit: count-only defaults to COUNT, category defaults to a single shared categoryDisplayType of COUNT', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: FACILITY_LAYER,
                legend: { items: [{ name: 'Facility' }] },
            })
        ).toEqual({ count: 'COUNT' })

        expect(
            getDefaultCombinedAggregation({
                layer: ORG_UNIT_LAYER,
                organisationUnitGroupSet: { id: 'groupSet1' },
                legend: {
                    items: [
                        { id: 'group1', name: 'Hospital' },
                        { id: 'group2', name: 'Clinic' },
                    ],
                },
            })
        ).toEqual({ categoryDisplayType: 'COUNT' })
    })

    test('Event: a numeric styleDataItem defaults to SUM - there is no per-data-item aggregationType metadata for event data elements the way there is for Thematic', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', valueType: 'NUMBER' },
                legend: { items: [{ name: 'Low' }, { name: 'High' }] },
            })
        ).toEqual({ value: 'SUM' })
    })

    test('Event: category dataKeys default to a single shared categoryDisplayType of COUNT', () => {
        expect(
            getDefaultCombinedAggregation({
                layer: EVENT_LAYER,
                styleDataItem: { id: 'de1', optionSet: { id: 'os1' } },
                legend: {
                    items: [
                        { name: 'Option A', colorGroup: 0 },
                        { name: 'Option B', colorGroup: 1 },
                    ],
                },
            })
        ).toEqual({ categoryDisplayType: 'COUNT' })
    })
})

const withOrgUnitRows = (layer, id) => ({
    layer,
    rows: [{ dimension: 'ou', items: [{ id, name: id }] }],
})

describe('getDefaultReferenceRows', () => {
    test('returns an empty array when no map view has an org unit selection', () => {
        expect(
            getDefaultReferenceRows([{ layer: THEMATIC_LAYER, rows: [] }])
        ).toEqual([])
    })

    test('prefers a Thematic layer over every other type', () => {
        const thematic = withOrgUnitRows(THEMATIC_LAYER, 'thematicOu')
        expect(
            getDefaultReferenceRows([
                withOrgUnitRows(TRACKED_ENTITY_LAYER, 'teOu'),
                withOrgUnitRows(ORG_UNIT_LAYER, 'orgUnitOu'),
                thematic,
                withOrgUnitRows(EARTH_ENGINE_LAYER, 'eeOu'),
            ])
        ).toBe(thematic.rows)
    })

    test('falls through to the next type in priority order when a higher-priority layer has no org units selected', () => {
        const facility = withOrgUnitRows(FACILITY_LAYER, 'facilityOu')
        expect(
            getDefaultReferenceRows([
                { layer: THEMATIC_LAYER, rows: [] },
                { layer: ORG_UNIT_LAYER, rows: [] },
                { layer: EARTH_ENGINE_LAYER, rows: [] },
                facility,
                withOrgUnitRows(EVENT_LAYER, 'eventOu'),
            ])
        ).toBe(facility.rows)
    })

    test('defaults to an empty array when no map views are given', () => {
        expect(getDefaultReferenceRows()).toEqual([])
    })

    const withLevel = (layer, id, level) => ({
        ...withOrgUnitRows(layer, id),
        data: [{ properties: { id, level } }],
    })

    test('prefers the coarser (lower) org unit level over the type priority order', () => {
        const facility = withLevel(FACILITY_LAYER, 'facilityOu', 1)
        const thematic = withLevel(THEMATIC_LAYER, 'thematicOu', 3)
        expect(getDefaultReferenceRows([thematic, facility])).toBe(
            facility.rows
        )
    })

    test('breaks a level tie using the type priority order', () => {
        const orgUnit = withLevel(ORG_UNIT_LAYER, 'orgUnitOu', 2)
        const thematic = withLevel(THEMATIC_LAYER, 'thematicOu', 2)
        expect(getDefaultReferenceRows([orgUnit, thematic])).toBe(thematic.rows)
    })

    test('prefers the coarser of two layers of the same type', () => {
        const fineThematic = withLevel(THEMATIC_LAYER, 'fine', 3)
        const coarseThematic = withLevel(THEMATIC_LAYER, 'coarse', 1)
        expect(getDefaultReferenceRows([fineThematic, coarseThematic])).toBe(
            coarseThematic.rows
        )
    })

    test('falls back to type priority when a candidate has no loaded data to compare a level from yet', () => {
        const thematicNotYetLoaded = withOrgUnitRows(
            THEMATIC_LAYER,
            'thematicOu'
        )
        const facility = withLevel(FACILITY_LAYER, 'facilityOu', 1)
        expect(getDefaultReferenceRows([facility, thematicNotYetLoaded])).toBe(
            thematicNotYetLoaded.rows
        )
    })
})

describe('shouldClearFeatureHighlight', () => {
    test('clears when leaving to no element (cursor exits the window)', () => {
        expect(shouldClearFeatureHighlight({ relatedTarget: null })).toBe(true)
    })

    test('does not clear when hovering to an adjacent row cell (TD)', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'TD' } })
        ).toBe(false)
    })

    test('clears when leaving to a non-TD element', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'DIV' } })
        ).toBe(true)
    })
})

describe('getRowId', () => {
    test('returns the id-keyed cell value when present', () => {
        const row = [
            { dataKey: 'name', value: 'Foo' },
            { dataKey: 'id', value: 'abc123' },
        ]
        expect(getRowId(row)).toBe('abc123')
    })

    test('falls back to the first cell itemId when there is no id cell', () => {
        const row = [{ dataKey: 'name', value: 'Foo', itemId: 'xyz789' }]
        expect(getRowId(row)).toBe('xyz789')
    })
})

describe('getRowClickAction', () => {
    const rows = [
        [{ dataKey: 'id', value: 'a', itemId: 'a' }],
        [{ dataKey: 'id', value: 'b', itemId: 'b' }],
        [{ dataKey: 'id', value: 'c', itemId: 'c' }],
        [{ dataKey: 'id', value: 'd', itemId: 'd' }],
    ]

    test('plain click is ignored', () => {
        expect(
            getRowClickAction(
                {},
                { id: 'b', rowIndex: 1, rows, lastClickedRowIndex: null }
            )
        ).toBeNull()
    })

    test('ctrl-click toggles just that row', () => {
        expect(
            getRowClickAction(
                { ctrlKey: true },
                { id: 'b', rowIndex: 1, rows, lastClickedRowIndex: null }
            )
        ).toEqual({ type: 'toggle', id: 'b' })
    })

    test('shift-click with no prior anchor falls back to a single-row toggle', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'c', rowIndex: 2, rows, lastClickedRowIndex: null }
            )
        ).toEqual({ type: 'toggle', id: 'c' })
    })

    test('shift-click with a prior anchor selects the range between them', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'd', rowIndex: 3, rows, lastClickedRowIndex: 1 }
            )
        ).toEqual({ type: 'range', ids: ['b', 'c', 'd'] })
    })

    test('shift-click range works regardless of anchor/target order', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'a', rowIndex: 0, rows, lastClickedRowIndex: 2 }
            )
        ).toEqual({ type: 'range', ids: ['a', 'b', 'c'] })
    })
})

describe('getNextSorting', () => {
    test('clicking an unsorted column starts at ascending', () => {
        expect(
            getNextSorting('name', { sortField: null, sortDirection: 'asc' })
        ).toEqual({ sortField: 'name', sortDirection: 'asc' })
    })

    test('clicking the ascending-sorted column moves to descending', () => {
        expect(
            getNextSorting('name', { sortField: 'name', sortDirection: 'asc' })
        ).toEqual({ sortField: 'name', sortDirection: 'desc' })
    })

    test('clicking the descending-sorted default column resets to itself ascending - a 2-state toggle since it already is the default', () => {
        expect(
            getNextSorting('name', { sortField: 'name', sortDirection: 'desc' })
        ).toEqual({ sortField: 'name', sortDirection: 'asc' })
    })

    test('clicking a different column restarts the cycle at ascending', () => {
        expect(
            getNextSorting('type', { sortField: 'name', sortDirection: 'desc' })
        ).toEqual({ sortField: 'type', sortDirection: 'asc' })
    })

    test("clicking a non-default column's third time (descending) resets to the table's actual default sort, matching what it shows on initial load - not an unsorted/natural-order state", () => {
        expect(
            getNextSorting('type', { sortField: 'type', sortDirection: 'desc' })
        ).toEqual({ sortField: 'name', sortDirection: 'asc' })
    })

    test('honors a custom defaultSortField/defaultSortDirection when resetting', () => {
        expect(
            getNextSorting(
                'type',
                { sortField: 'type', sortDirection: 'desc' },
                { defaultSortField: 'level', defaultSortDirection: 'desc' }
            )
        ).toEqual({ sortField: 'level', sortDirection: 'desc' })
    })
})

describe('isFilterable', () => {
    test('allows numeric and string columns', () => {
        expect(isFilterable('rawValue', 'number')).toBe(true)
        expect(isFilterable('name', 'string')).toBe(true)
    })

    test('excludes columns with no type (no known filter UI for them)', () => {
        expect(isFilterable('someKey', undefined)).toBe(false)
    })
})

describe('hasActiveDataTableFilters', () => {
    const empty = {
        dataFilters: {},
        globalSearch: '',
        selectionFilter: [],
        showOnlyFeaturesInView: false,
    }

    test('is false when nothing is filtered', () => {
        expect(hasActiveDataTableFilters(empty)).toBe(false)
    })

    test('is true when a column filter is set', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                dataFilters: { name: 'foo' },
            })
        ).toBe(true)
    })

    test('is true for a non-blank global search, trimmed', () => {
        expect(
            hasActiveDataTableFilters({ ...empty, globalSearch: '  ' })
        ).toBe(false)
        expect(
            hasActiveDataTableFilters({ ...empty, globalSearch: ' foo ' })
        ).toBe(true)
    })

    test('is true when a selection filter is applied', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                selectionFilter: ['selected'],
            })
        ).toBe(true)
    })

    test('is true when showOnlyFeaturesInView is on, even with nothing else set', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                showOnlyFeaturesInView: true,
            })
        ).toBe(true)
    })
})

describe('buildFeatureIndex', () => {
    test('indexes features by properties.id when present', () => {
        const data = [{ properties: { id: 'a' } }, { properties: { id: 'b' } }]
        const index = buildFeatureIndex(data)
        expect(index.get('a')).toBe(data[0])
        expect(index.get('b')).toBe(data[1])
    })

    test('falls back to the feature’s own top-level id', () => {
        const feature = { id: 'a', properties: {} }
        expect(buildFeatureIndex([feature]).get('a')).toBe(feature)
    })

    test('skips features with no id anywhere', () => {
        const index = buildFeatureIndex([{ properties: {} }])
        expect(index.size).toBe(0)
    })

    test('returns an empty index for missing/empty data', () => {
        expect(buildFeatureIndex(undefined).size).toBe(0)
        expect(buildFeatureIndex([]).size).toBe(0)
    })
})

describe('getEligibleDataTableLayers', () => {
    test('includes data-table-capable layer types that have finished loading', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: true, data: [{}] },
            {
                id: 'b',
                layer: THEMATIC_LAYER,
                isLoaded: true,
                data: [{}, {}],
            },
        ]
        expect(getEligibleDataTableLayers(mapViews).map((l) => l.id)).toEqual([
            'a',
            'b',
        ])
    })

    test('excludes layer types with no data table support', () => {
        const mapViews = [
            { id: 'a', layer: EXTERNAL_LAYER, isLoaded: true, data: [{}] },
        ]
        expect(getEligibleDataTableLayers(mapViews)).toEqual([])
    })

    test('excludes a data-table-capable layer that has not finished loading yet', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: false, data: [{}] },
        ]
        expect(getEligibleDataTableLayers(mapViews)).toEqual([])
    })

    test('includes a loaded, data-table-capable layer with no valid data - the caller shows an explanatory message instead of hiding it', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: true, data: [] },
        ]
        expect(getEligibleDataTableLayers(mapViews).map((l) => l.id)).toEqual([
            'a',
        ])
    })
})

describe('isDataTableOpen', () => {
    test('is open when at least one tab is open', () => {
        expect(
            isDataTableOpen({ openIds: ['layer1'], combinedView: false })
        ).toBe(true)
    })

    test('is open when Combined is active, even with no open tabs', () => {
        expect(isDataTableOpen({ openIds: [], combinedView: true })).toBe(true)
    })

    test('is closed when there are no open tabs and Combined is not active', () => {
        expect(isDataTableOpen({ openIds: [], combinedView: false })).toBe(
            false
        )
    })
})

describe('getLayerSelectedIds', () => {
    test('returns an empty array when there is no selection', () => {
        expect(getLayerSelectedIds(null, 'layer1')).toEqual([])
    })

    test("returns this layer's own selected ids when selection.layerId matches", () => {
        expect(
            getLayerSelectedIds(
                { layerId: 'layer1', ids: ['a', 'b'] },
                'layer1'
            )
        ).toEqual(['a', 'b'])
    })

    test('returns crossLayerIds ids when selection.layerId belongs to no single layer (Combined)', () => {
        expect(
            getLayerSelectedIds(
                { layerId: null, ids: [], crossLayerIds: { layer1: ['x'] } },
                'layer1'
            )
        ).toEqual(['x'])
    })

    test('merges crossLayerIds with a same-layer selection, deduping', () => {
        expect(
            getLayerSelectedIds(
                {
                    layerId: 'layer1',
                    ids: ['a'],
                    crossLayerIds: { layer1: ['a', 'b'] },
                },
                'layer1'
            )
        ).toEqual(['a', 'b'])
    })

    test('ignores a selection/crossLayerIds entry belonging to another layer', () => {
        expect(
            getLayerSelectedIds(
                {
                    layerId: 'other-layer',
                    ids: ['a'],
                    crossLayerIds: { 'other-layer': ['a'] },
                },
                'layer1'
            )
        ).toEqual([])
    })
})

describe('mergeCrossLayerIds', () => {
    const rowFeatureIds = new Map([
        ['ou1', { layerA: ['a1'], layerB: ['b1'] }],
        ['ou2', { layerA: ['a2'] }],
    ])

    test('unions per-layer id sets across every named row', () => {
        expect(mergeCrossLayerIds(['ou1', 'ou2'], rowFeatureIds)).toEqual({
            layerA: ['a1', 'a2'],
            layerB: ['b1'],
        })
    })

    test('dedupes ids repeated across rows for the same layer', () => {
        const withOverlap = new Map([
            ['ou1', { layerA: ['a1'] }],
            ['ou2', { layerA: ['a1', 'a2'] }],
        ])
        expect(mergeCrossLayerIds(['ou1', 'ou2'], withOverlap)).toEqual({
            layerA: ['a1', 'a2'],
        })
    })

    test('skips row keys with no entry', () => {
        expect(mergeCrossLayerIds(['ou1', 'missing'], rowFeatureIds)).toEqual({
            layerA: ['a1'],
            layerB: ['b1'],
        })
    })

    test('returns an empty object for no rows', () => {
        expect(mergeCrossLayerIds([], rowFeatureIds)).toEqual({})
    })
})

describe('getUnionBounds', () => {
    const point = (id, coordinates) => ({
        type: 'Feature',
        properties: { id },
        geometry: { type: 'Point', coordinates },
    })

    const layers = [
        {
            id: 'layerA',
            data: [point('a1', [0, 0]), point('a2', [10, 10])],
        },
        { id: 'layerB', data: [point('b1', [5, -5])] },
    ]

    test('computes the union bbox across every named feature on every layer', () => {
        expect(
            getUnionBounds(layers, { layerA: ['a1', 'a2'], layerB: ['b1'] })
        ).toEqual([
            [0, -5],
            [10, 10],
        ])
    })

    test('ignores layers/ids not named in idsByLayerId', () => {
        expect(getUnionBounds(layers, { layerA: ['a1'] })).toEqual([
            [0, 0],
            [0, 0],
        ])
    })

    test('returns null when nothing matches', () => {
        expect(getUnionBounds(layers, {})).toBeNull()
    })

    test('skips ids that have no matching feature or geometry', () => {
        expect(getUnionBounds(layers, { layerA: ['missing'] })).toBeNull()
    })
})

describe('getPanelHeights', () => {
    test('clamps the table height to the window, minus header/toolbar', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 1000,
            isCollapsed: false,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result).toEqual({
            maxHeight: 700,
            collapsedHeight: 32,
            displayHeight: 700,
        })
    })

    test('uses the saved height as-is when it already fits', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 300,
            isCollapsed: false,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result.displayHeight).toBe(300)
    })

    test('collapses to just the controls height, regardless of the saved height', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 300,
            isCollapsed: true,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result.displayHeight).toBe(32)
    })
})
