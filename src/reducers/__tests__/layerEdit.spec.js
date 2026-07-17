import * as types from '../../constants/actionTypes.js'
import { EVENT_STATUS_ALL } from '../../constants/eventStatuses.js'
import {
    CLASSIFICATION_SINGLE_COLOR,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_PREDEFINED,
    THEMATIC_CHOROPLETH,
    EE_BUFFER,
    NONE,
} from '../../constants/layers.js'
import { START_END_DATES } from '../../constants/periods.js'
import {
    setDataItemInColumns,
    setOrgUnitPathInRows,
    setFiltersFromPeriods,
    removePeriodFromFilters,
    changeDimensionInFilters,
    removeDimensionFromFilters,
} from '../../util/analytics.js'
import layerEdit from '../layerEdit.js'

describe('layerEdit reducer', () => {
    it('returns null by default', () => {
        expect(layerEdit(undefined, { type: 'UNKNOWN' })).toBe(null)
    })

    describe('LAYER_EDIT / LAYER_CANCEL', () => {
        it('replaces state with the layer payload and strips the img field', () => {
            const payload = { id: 'layer1', img: 'thumb.png', name: 'Layer 1' }

            const result = layerEdit(null, {
                type: types.LAYER_EDIT,
                payload,
            })

            expect(result).toBe(payload)
            expect(result).toEqual({ id: 'layer1', name: 'Layer 1' })
        })

        it('clears the state on cancel', () => {
            expect(
                layerEdit({ id: 'layer1' }, { type: types.LAYER_CANCEL })
            ).toBe(null)
        })
    })

    describe('LAYER_EDIT_PROGRAM_SET / LAYER_EDIT_PROGRAM_STAGE_SET', () => {
        it('keeps countEventsOutsideOrgUnits and countFeaturesWithoutCoordinates when the program changes', () => {
            const state = {
                countEventsOutsideOrgUnits: true,
                countFeaturesWithoutCoordinates: true,
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_PROGRAM_SET,
                program: { id: 'prog1' },
            })

            expect(result.countEventsOutsideOrgUnits).toBe(true)
            expect(result.countFeaturesWithoutCoordinates).toBe(true)
        })

        it('keeps countEventsOutsideOrgUnits and countFeaturesWithoutCoordinates when the program stage changes', () => {
            const state = {
                countEventsOutsideOrgUnits: true,
                countFeaturesWithoutCoordinates: true,
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_PROGRAM_STAGE_SET,
                programStage: { id: 'stage1' },
            })

            expect(result.countEventsOutsideOrgUnits).toBe(true)
            expect(result.countFeaturesWithoutCoordinates).toBe(true)
        })

        it('resets columns/programStage/styleDataItem/labelDataItem when the program changes', () => {
            const state = {
                columns: [{ dimension: 'dx' }],
                programStage: { id: 'stage1' },
                styleDataItem: { id: 'sd1' },
                labelDataItem: { id: 'ld1' },
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_PROGRAM_SET,
                program: { id: 'prog1' },
            })

            expect(result).toEqual({
                ...state,
                program: { id: 'prog1' },
                columns: [],
                programStage: null,
                styleDataItem: null,
                labelDataItem: null,
            })
        })

        it('sets program to null when the program is cleared', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_PROGRAM_SET, program: null }
            )

            expect(result.program).toBe(null)
        })

        it('resets columns/styleDataItem/labelDataItem when the program stage changes', () => {
            const state = {
                columns: [{ dimension: 'dx' }],
                styleDataItem: { id: 'sd1' },
                labelDataItem: { id: 'ld1' },
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_PROGRAM_STAGE_SET,
                programStage: { id: 'stage1' },
            })

            expect(result).toEqual({
                ...state,
                programStage: { id: 'stage1' },
                columns: [],
                styleDataItem: null,
                labelDataItem: null,
            })
        })
    })

    describe('LAYER_EDIT_DATA_ITEM_SET', () => {
        it('sets columns from the data item and dimension, and clears the layer name', () => {
            const dataItem = { id: 'de1', name: 'Data element 1' }

            const result = layerEdit(
                { name: 'Old name' },
                {
                    type: types.LAYER_EDIT_DATA_ITEM_SET,
                    dataItem,
                    dimension: 'dataElement',
                }
            )

            expect(result).toEqual({
                name: null,
                columns: setDataItemInColumns(dataItem, 'dataElement'),
            })
        })
    })

    describe('period fields', () => {
        it('sets the period name', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_PERIOD_NAME_SET,
                    periodName: 'Last year',
                }
            )

            expect(result.periodName).toBe('Last year')
        })

        describe('LAYER_EDIT_PERIOD_TYPE_SET', () => {
            it('clears the period filter when keepPeriod is false', () => {
                const state = {
                    periodType: 'FIXED',
                    filters: [
                        { dimension: 'pe', items: [] },
                        { dimension: 'dx123', items: [] },
                    ],
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_PERIOD_TYPE_SET,
                    periodType: { value: 'RELATIVE' },
                    keepPeriod: false,
                })

                expect(result.periodType).toBe('RELATIVE')
                expect(result.filters).toEqual(
                    removePeriodFromFilters(state.filters)
                )
            })

            it('keeps the existing filters when keepPeriod is true', () => {
                const state = {
                    periodType: 'FIXED',
                    filters: [{ dimension: 'pe', items: [] }],
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_PERIOD_TYPE_SET,
                    periodType: { value: 'RELATIVE' },
                    keepPeriod: true,
                })

                expect(result.filters).toBe(state.filters)
            })
        })

        describe('LAYER_EDIT_PERIODS_SET', () => {
            it('sets filters from the given periods', () => {
                const state = { filters: [] }
                const periods = [{ id: '2021' }, { id: '2022' }]

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_PERIODS_SET,
                    periods,
                })

                expect(result.filters).toEqual(
                    setFiltersFromPeriods(state.filters, periods)
                )
            })

            it('clears filters when the only period is the START_END_DATES sentinel', () => {
                const state = { filters: [{ dimension: 'pe', items: [] }] }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_PERIODS_SET,
                    periods: [{ id: START_END_DATES }],
                })

                expect(result.filters).toEqual([])
            })
        })

        it('sets the periods/dates backup', () => {
            const backup = { periods: [{ id: '2021' }] }

            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_BACKUP_PERIODSDATES_SET,
                    backupPeriodsDates: backup,
                }
            )

            expect(result.backupPeriodsDates).toBe(backup)
        })

        it('sets the rendering strategy', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_RENDERING_STRATEGY_SET,
                    payload: 'SINGLE',
                }
            )

            expect(result.renderingStrategy).toBe('SINGLE')
        })

        it('sets the start date', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_START_DATE_SET,
                    startDate: '2021-01-01',
                }
            )

            expect(result.startDate).toBe('2021-01-01')
        })

        it('sets the end date', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_END_DATE_SET, endDate: '2021-12-31' }
            )

            expect(result.endDate).toBe('2021-12-31')
        })
    })

    describe('LAYER_EDIT_AGGREGATION_TYPE_SET', () => {
        it('deletes aggregationType when set to DEFAULT', () => {
            const result = layerEdit(
                { aggregationType: 'SUM' },
                {
                    type: types.LAYER_EDIT_AGGREGATION_TYPE_SET,
                    aggregationType: 'DEFAULT',
                }
            )

            expect(result.aggregationType).toBeUndefined()
        })

        it('sets aggregationType for any other value', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_AGGREGATION_TYPE_SET,
                    aggregationType: 'SUM',
                }
            )

            expect(result.aggregationType).toBe('SUM')
        })
    })

    describe('dimension filters', () => {
        it('adds a dimension filter', () => {
            const result = layerEdit(
                { filters: [{ dimension: 'ou' }] },
                {
                    type: types.LAYER_EDIT_DIMENSION_FILTER_ADD,
                    filter: { dimension: 'dx1' },
                }
            )

            expect(result.filters).toEqual([
                { dimension: 'ou' },
                { dimension: 'dx1' },
            ])
        })

        it('adds a default empty filter when none is given', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_DIMENSION_FILTER_ADD }
            )

            expect(result.filters).toEqual([{ dimension: null }])
        })

        it('removes a dimension filter by index', () => {
            const filters = [{ dimension: 'dx1' }, { dimension: 'dx2' }]

            const result = layerEdit(
                { filters },
                { type: types.LAYER_EDIT_DIMENSION_FILTER_REMOVE, index: 0 }
            )

            expect(result.filters).toEqual(
                removeDimensionFromFilters(filters, 0)
            )
        })

        it('changes a dimension filter by index', () => {
            const filters = [{ dimension: 'dx1' }]
            const newFilter = { dimension: 'dx1', items: [{ id: 'a' }] }

            const result = layerEdit(
                { filters },
                {
                    type: types.LAYER_EDIT_DIMENSION_FILTER_CHANGE,
                    index: 0,
                    filter: newFilter,
                }
            )

            expect(result.filters).toEqual(
                changeDimensionInFilters(filters, 0, newFilter)
            )
        })
    })

    describe('event filters (columns)', () => {
        it('adds an event filter column', () => {
            const result = layerEdit(
                { columns: [{ dimension: 'dx' }] },
                {
                    type: types.LAYER_EDIT_FILTER_ADD,
                    filter: { dimension: 'de1', filter: 'GT:5' },
                }
            )

            expect(result.columns).toEqual([
                { dimension: 'dx' },
                { dimension: 'de1', filter: 'GT:5' },
            ])
        })

        it('adds a default empty filter column when none is given', () => {
            const result = layerEdit(
                { columns: [] },
                { type: types.LAYER_EDIT_FILTER_ADD }
            )

            expect(result.columns).toEqual([
                { dimension: null, name: null, filter: null },
            ])
        })

        describe('LAYER_EDIT_FILTER_REMOVE', () => {
            it('removes a filter row by index, recompacting combined filters', () => {
                const columns = [{ dimension: 'de1', filter: 'GT:5:LT:10' }]

                const result = layerEdit(
                    { columns },
                    { type: types.LAYER_EDIT_FILTER_REMOVE, index: 0 }
                )

                expect(result.columns).toEqual([
                    { dimension: 'de1', filter: 'LT:10' },
                ])
            })

            it('returns state unchanged when the index is out of range', () => {
                const state = {
                    columns: [{ dimension: 'de1', filter: 'GT:5' }],
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_FILTER_REMOVE,
                    index: 5,
                })

                expect(result).toBe(state)
            })
        })

        describe('LAYER_EDIT_FILTER_CHANGE', () => {
            it('replaces a filter row by index, recompacting combined filters', () => {
                const columns = [{ dimension: 'de1', filter: 'GT:5' }]

                const result = layerEdit(
                    { columns },
                    {
                        type: types.LAYER_EDIT_FILTER_CHANGE,
                        index: 0,
                        filter: { dimension: 'de1', filter: 'LT:20' },
                    }
                )

                expect(result.columns).toEqual([
                    { dimension: 'de1', filter: 'LT:20' },
                ])
            })

            it('returns state unchanged when the index is out of range', () => {
                const state = {
                    columns: [{ dimension: 'de1', filter: 'GT:5' }],
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_FILTER_CHANGE,
                    index: 5,
                    filter: {},
                })

                expect(result).toBe(state)
            })
        })
    })

    describe('thematic style', () => {
        it('sets the style data item', () => {
            const dataItem = { id: 'de1' }

            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_STYLE_DATA_ITEM_SET,
                    dataItem,
                }
            )

            expect(result.styleDataItem).toBe(dataItem)
        })

        it('sets option-set options and clears method/classes/colorScale', () => {
            const state = {
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: ['a'],
                styleDataItem: { optionSet: { options: [] } },
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_STYLE_DATA_ITEM_OPTIONS_SET,
                options: [{ code: 'A' }],
            })

            expect(result.styleDataItem.optionSet.options).toEqual([
                { code: 'A' },
            ])
            expect(result.method).toBeUndefined()
            expect(result.classes).toBeUndefined()
            expect(result.colorScale).toBeUndefined()
        })

        it('sets a boolean style value and clears method/classes/colorScale', () => {
            const state = {
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: ['a'],
                styleDataItem: { values: {} },
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_STYLE_DATA_ITEM_BOOLEAN_SET,
                value: 'true',
                color: '#fff',
            })

            expect(result.styleDataItem.values).toEqual({ true: '#fff' })
            expect(result.method).toBeUndefined()
            expect(result.classes).toBeUndefined()
            expect(result.colorScale).toBeUndefined()
        })

        describe('LAYER_EDIT_THEMATIC_MAP_TYPE_SET', () => {
            it('clears method/colorScale/classes when switching to choropleth from single color', () => {
                const state = {
                    method: CLASSIFICATION_SINGLE_COLOR,
                    colorScale: ['a'],
                    classes: 1,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_THEMATIC_MAP_TYPE_SET,
                    payload: THEMATIC_CHOROPLETH,
                })

                expect(result.thematicMapType).toBe(THEMATIC_CHOROPLETH)
                expect(result.method).toBeUndefined()
                expect(result.colorScale).toBeUndefined()
                expect(result.classes).toBeUndefined()
            })

            it('keeps method/colorScale/classes when the target type is not choropleth', () => {
                const state = {
                    method: CLASSIFICATION_SINGLE_COLOR,
                    colorScale: ['a'],
                    classes: 1,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_THEMATIC_MAP_TYPE_SET,
                    payload: 'BUBBLE',
                })

                expect(result.method).toBe(CLASSIFICATION_SINGLE_COLOR)
                expect(result.colorScale).toEqual(['a'])
                expect(result.classes).toBe(1)
            })

            it('keeps method/colorScale/classes when the previous method was not single color', () => {
                const state = {
                    method: CLASSIFICATION_EQUAL_INTERVALS,
                    colorScale: ['a'],
                    classes: 1,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_THEMATIC_MAP_TYPE_SET,
                    payload: THEMATIC_CHOROPLETH,
                })

                expect(result.method).toBe(CLASSIFICATION_EQUAL_INTERVALS)
                expect(result.colorScale).toEqual(['a'])
                expect(result.classes).toBe(1)
            })
        })

        describe('LAYER_EDIT_CLASSIFICATION_SET', () => {
            it('keeps colorScale/classes and clears legendSet for a valid non-predefined method', () => {
                const state = {
                    colorScale: ['a'],
                    classes: 1,
                    legendSet: { id: 'ls1' },
                    legendDecimalPlaces: 2,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_CLASSIFICATION_SET,
                    method: CLASSIFICATION_EQUAL_INTERVALS,
                })

                expect(result.method).toBe(CLASSIFICATION_EQUAL_INTERVALS)
                expect(result.colorScale).toEqual(['a'])
                expect(result.classes).toBe(1)
                expect(result.legendSet).toBeUndefined()
                expect(result.legendDecimalPlaces).toBe(2)
            })

            it('clears colorScale/classes when switching away from single color', () => {
                const state = {
                    method: CLASSIFICATION_SINGLE_COLOR,
                    colorScale: ['a'],
                    classes: 1,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_CLASSIFICATION_SET,
                    method: CLASSIFICATION_EQUAL_INTERVALS,
                })

                expect(result.colorScale).toBeUndefined()
                expect(result.classes).toBeUndefined()
            })

            it('clears colorScale/classes/legendDecimalPlaces and keeps legendSet for predefined classification', () => {
                const state = {
                    colorScale: ['a'],
                    classes: 1,
                    legendSet: { id: 'ls1' },
                    legendDecimalPlaces: 2,
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_CLASSIFICATION_SET,
                    method: CLASSIFICATION_PREDEFINED,
                })

                expect(result.colorScale).toBeUndefined()
                expect(result.classes).toBeUndefined()
                expect(result.legendDecimalPlaces).toBeUndefined()
                expect(result.legendSet).toEqual({ id: 'ls1' })
            })

            it('clears styleDataItem.optionSet when present', () => {
                const state = {
                    styleDataItem: { optionSet: { options: [] } },
                }

                const result = layerEdit(state, {
                    type: types.LAYER_EDIT_CLASSIFICATION_SET,
                    method: CLASSIFICATION_EQUAL_INTERVALS,
                })

                expect(result.styleDataItem.optionSet).toBeUndefined()
            })
        })

        it('sets the color scale and derives classes from its length', () => {
            const result = layerEdit(
                { styleDataItem: { optionSet: {} } },
                {
                    type: types.LAYER_EDIT_COLOR_SCALE_SET,
                    colorScale: ['a', 'b', 'c'],
                }
            )

            expect(result.colorScale).toEqual(['a', 'b', 'c'])
            expect(result.classes).toBe(3)
            expect(result.styleDataItem.optionSet).toBeUndefined()
        })

        it('sets the color scale without touching styleDataItem when there is none', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_COLOR_SCALE_SET,
                    colorScale: ['a', 'b'],
                }
            )

            expect(result.colorScale).toEqual(['a', 'b'])
            expect(result.classes).toBe(2)
            expect(result.styleDataItem).toBeUndefined()
        })

        describe('LAYER_EDIT_LEGEND_DECIMAL_PLACES_SET', () => {
            it('sets legendDecimalPlaces', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_LEGEND_DECIMAL_PLACES_SET,
                        legendDecimalPlaces: 2,
                    }
                )

                expect(result.legendDecimalPlaces).toBe(2)
            })

            it('deletes legendDecimalPlaces when set to undefined', () => {
                const result = layerEdit(
                    { legendDecimalPlaces: 2 },
                    {
                        type: types.LAYER_EDIT_LEGEND_DECIMAL_PLACES_SET,
                        legendDecimalPlaces: undefined,
                    }
                )

                expect(result.legendDecimalPlaces).toBeUndefined()
            })
        })

        describe('LAYER_EDIT_LEGEND_ISOLATED_SET', () => {
            it('sets legendIsolated when truthy', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_LEGEND_ISOLATED_SET,
                        legendIsolated: true,
                    }
                )

                expect(result.legendIsolated).toBe(true)
            })

            it('deletes legendIsolated when falsy', () => {
                const result = layerEdit(
                    { legendIsolated: true },
                    {
                        type: types.LAYER_EDIT_LEGEND_ISOLATED_SET,
                        legendIsolated: false,
                    }
                )

                expect(result.legendIsolated).toBeUndefined()
            })
        })

        it('sets the legend set', () => {
            const legendSet = { id: 'ls1' }

            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_LEGEND_SET_SET, legendSet }
            )

            expect(result.legendSet).toBe(legendSet)
        })

        describe('LAYER_EDIT_NO_DATA_LEGEND_SET', () => {
            it('sets noDataLegend when truthy', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_NO_DATA_LEGEND_SET,
                        payload: true,
                    }
                )

                expect(result.noDataLegend).toBe(true)
            })

            it('deletes noDataLegend when falsy', () => {
                const result = layerEdit(
                    { noDataLegend: true },
                    {
                        type: types.LAYER_EDIT_NO_DATA_LEGEND_SET,
                        payload: false,
                    }
                )

                expect(result.noDataLegend).toBeUndefined()
            })
        })

        describe('LAYER_EDIT_UNCLASSIFIED_LEGEND_SET', () => {
            it('sets unclassifiedLegend when truthy', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_UNCLASSIFIED_LEGEND_SET,
                        payload: true,
                    }
                )

                expect(result.unclassifiedLegend).toBe(true)
            })

            it('deletes unclassifiedLegend when falsy', () => {
                const result = layerEdit(
                    { unclassifiedLegend: true },
                    {
                        type: types.LAYER_EDIT_UNCLASSIFIED_LEGEND_SET,
                        payload: false,
                    }
                )

                expect(result.unclassifiedLegend).toBeUndefined()
            })
        })
    })

    describe('event layer fields', () => {
        describe('LAYER_EDIT_EVENT_STATUS_SET', () => {
            it('deletes eventStatus when set to ALL', () => {
                const result = layerEdit(
                    { eventStatus: 'ACTIVE' },
                    {
                        type: types.LAYER_EDIT_EVENT_STATUS_SET,
                        status: EVENT_STATUS_ALL,
                    }
                )

                expect(result.eventStatus).toBeUndefined()
            })

            it('sets eventStatus for any other value', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_EVENT_STATUS_SET,
                        status: 'ACTIVE',
                    }
                )

                expect(result.eventStatus).toBe('ACTIVE')
            })
        })

        it('sets the event coordinate field and type', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_EVENT_COORDINATE_FIELD_SET,
                    fieldId: 'field1',
                    fieldType: 'COORDINATE',
                }
            )

            expect(result.eventCoordinateField).toBe('field1')
            expect(result.eventCoordinateFieldType).toBe('COORDINATE')
        })

        describe('LAYER_EDIT_FALLBACK_COORDINATE_FIELD_SET', () => {
            it('deletes fallbackCoordinateField when set to NONE', () => {
                const result = layerEdit(
                    { fallbackCoordinateField: 'field1' },
                    {
                        type: types.LAYER_EDIT_FALLBACK_COORDINATE_FIELD_SET,
                        fieldId: NONE,
                    }
                )

                expect(result.fallbackCoordinateField).toBeUndefined()
            })

            it('sets fallbackCoordinateField for any other value', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_FALLBACK_COORDINATE_FIELD_SET,
                        fieldId: 'field1',
                    }
                )

                expect(result.fallbackCoordinateField).toBe('field1')
            })
        })

        it('sets eventClustering', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_EVENT_CLUSTERING_SET,
                    checked: true,
                }
            )

            expect(result.eventClustering).toBe(true)
        })

        it('sets countFeaturesWithoutCoordinates', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_COUNT_FEATURES_WITHOUT_COORDS_SET,
                    checked: true,
                }
            )

            expect(result.countFeaturesWithoutCoordinates).toBe(true)
        })

        it('sets countEventsOutsideOrgUnits', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_COUNT_EVENTS_OUTSIDE_OU_SET,
                    checked: true,
                }
            )

            expect(result.countEventsOutsideOrgUnits).toBe(true)
        })

        it('sets eventPointRadius, parsed to an integer', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_EVENT_POINT_RADIUS_SET,
                    radius: '5',
                }
            )

            expect(result.eventPointRadius).toBe(5)
        })

        it('sets eventPointColor', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_EVENT_POINT_COLOR_SET,
                    color: '#fff',
                }
            )

            expect(result.eventPointColor).toBe('#fff')
        })

        it('sets relatedPointColor', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_RELATED_POINT_COLOR_SET,
                    color: '#fff',
                }
            )

            expect(result.relatedPointColor).toBe('#fff')
        })

        it('sets relatedPointRadius, parsed to an integer', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_RELATED_POINT_RADIUS_SET,
                    radius: '8',
                }
            )

            expect(result.relatedPointRadius).toBe(8)
        })

        it('sets relationshipLineColor', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_RELATIONSHIP_LINE_COLOR_SET,
                    color: '#fff',
                }
            )

            expect(result.relationshipLineColor).toBe('#fff')
        })

        it('sets geometryCentroid', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_GEOMETRY_CENTROIDS_SET,
                    payload: true,
                }
            )

            expect(result.geometryCentroid).toBe(true)
        })
    })

    describe('org unit fields', () => {
        it('sets organisationUnitGroupSet', () => {
            const ougs = { id: 'ougs1' }

            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_ORGANISATION_UNIT_GROUP_SET,
                    organisationUnitGroupSet: ougs,
                }
            )

            expect(result.organisationUnitGroupSet).toBe(ougs)
        })

        it('sets organisationUnitColor', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_ORGANISATION_UNIT_COLOR_SET,
                    color: '#fff',
                }
            )

            expect(result.organisationUnitColor).toBe('#fff')
        })

        describe('LAYER_EDIT_ORGANISATION_UNIT_FIELD_SET', () => {
            it('sets orgUnitField/displayName and clears areaRadius for a real field', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_ORGANISATION_UNIT_FIELD_SET,
                        payload: { id: 'field1', name: 'Field 1' },
                    }
                )

                expect(result.orgUnitField).toBe('field1')
                expect(result.orgUnitFieldDisplayName).toBe('Field 1')
                expect(result.areaRadius).toBe(null)
            })

            it('defaults areaRadius to EE_BUFFER and clears the display name when NONE', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_ORGANISATION_UNIT_FIELD_SET,
                        payload: { id: NONE, name: 'None' },
                    }
                )

                expect(result.orgUnitField).toBe(NONE)
                expect(result.orgUnitFieldDisplayName).toBe(null)
                expect(result.areaRadius).toBe(EE_BUFFER)
            })
        })

        it('sets organisation units as the rows payload', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_ORGANISATION_UNITS_SET,
                    payload: { id: 'ou1' },
                }
            )

            expect(result.rows).toEqual([{ id: 'ou1' }])
        })

        it('sets the organisation unit tree path', () => {
            const rows = [{ dimension: 'ou', items: [{ id: 'ou1' }] }]

            const result = layerEdit(
                { rows },
                {
                    type: types.LAYER_EDIT_ORGANISATION_UNIT_PATH_SET,
                    id: 'ou1',
                    path: '/root/ou1',
                }
            )

            expect(result.rows).toEqual(
                setOrgUnitPathInRows(rows, 'ou1', '/root/ou1')
            )
        })

        it('sets organisationUnitSelectionMode', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_ORGANISATION_UNIT_MODE_SET,
                    payload: 'SELECT',
                }
            )

            expect(result.organisationUnitSelectionMode).toBe('SELECT')
        })

        it('sets bufferRadius (areaRadius)', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_BUFFER_RADIUS_SET,
                    radius: 500,
                }
            )

            expect(result.areaRadius).toBe(500)
        })

        it('sets radiusLow, parsed to an integer', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_RADIUS_LOW_SET, radius: '2' }
            )

            expect(result.radiusLow).toBe(2)
        })

        it('sets radiusHigh, parsed to an integer', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_RADIUS_HIGH_SET, radius: '10' }
            )

            expect(result.radiusHigh).toBe(10)
        })
    })

    describe('labels', () => {
        it('sets label visibility', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_LABELS_SET, isChecked: true }
            )

            expect(result.labels).toBe(true)
        })

        it('sets labelTemplate', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_LABEL_TEMPLATE,
                    template: '{name}',
                }
            )

            expect(result.labelTemplate).toBe('{name}')
        })

        it('sets labelFontColor', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_LABEL_FONT_COLOR_SET,
                    color: '#fff',
                }
            )

            expect(result.labelFontColor).toBe('#fff')
        })

        it('sets labelFontSize', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_LABEL_FONT_SIZE_SET, size: 12 }
            )

            expect(result.labelFontSize).toBe(12)
        })

        it('sets labelFontWeight', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_LABEL_FONT_WEIGHT_SET,
                    weight: 'bold',
                }
            )

            expect(result.labelFontWeight).toBe('bold')
        })

        it('sets labelFontStyle', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_LABEL_FONT_STYLE_SET,
                    style: 'italic',
                }
            )

            expect(result.labelFontStyle).toBe('italic')
        })

        describe('LAYER_EDIT_LABEL_DATA_ITEM_ID_SET', () => {
            it('sets labelDataItem when an item is given', () => {
                const item = { id: 'de1' }

                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_LABEL_DATA_ITEM_ID_SET,
                        item,
                    }
                )

                expect(result.labelDataItem).toBe(item)
            })

            it('deletes labelDataItem when no item is given', () => {
                const result = layerEdit(
                    { labelDataItem: { id: 'de1' } },
                    {
                        type: types.LAYER_EDIT_LABEL_DATA_ITEM_ID_SET,
                        item: null,
                    }
                )

                expect(result.labelDataItem).toBeUndefined()
            })
        })
    })

    describe('earth engine fields', () => {
        it('sets the layer style, merging with any existing style', () => {
            const result = layerEdit(
                { style: { color: '#000' } },
                {
                    type: types.LAYER_EDIT_STYLE_SET,
                    payload: { weight: 2 },
                }
            )

            expect(result.style).toEqual({ color: '#000', weight: 2 })
        })

        it('sets the collection filter', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_FILTER_SET,
                    filter: 'NDVI > 0.5',
                }
            )

            expect(result.filter).toBe('NDVI > 0.5')
        })

        it('sets the band', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_BAND_SET, payload: 'B4' }
            )

            expect(result.band).toBe('B4')
        })

        it('sets the earth engine period', () => {
            const period = { id: 'period1' }

            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_EARTH_ENGINE_PERIOD_SET,
                    payload: period,
                }
            )

            expect(result.period).toBe(period)
        })
    })

    describe('tracked entity fields', () => {
        it('sets trackedEntityType and resets program/programStage/relationshipType/relationshipOutsideProgram', () => {
            const state = {
                program: { id: 'p1' },
                programStage: { id: 's1' },
                relationshipType: { id: 'r1' },
                relationshipOutsideProgram: true,
            }

            const result = layerEdit(state, {
                type: types.LAYER_EDIT_TRACKED_ENTITY_TYPE_SET,
                trackedEntityType: { id: 'tet1' },
            })

            expect(result).toEqual({
                trackedEntityType: { id: 'tet1' },
                program: null,
                programStage: null,
                relationshipType: null,
                relationshipOutsideProgram: null,
            })
        })

        it('sets the tracked entity relationship type', () => {
            const relationshipType = { id: 'rt1' }

            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_TYPE_SET,
                    relationshipType,
                }
            )

            expect(result.relationshipType).toBe(relationshipType)
        })

        it('sets relationshipOutsideProgram', () => {
            const result = layerEdit(
                {},
                {
                    type: types.LAYER_EDIT_TRACKED_ENTITY_RELATIONSHIP_OUTSIDE_PROGRAM_SET,
                    payload: true,
                }
            )

            expect(result.relationshipOutsideProgram).toBe(true)
        })

        describe('LAYER_EDIT_PROGRAM_STATUS_SET', () => {
            it('deletes programStatus when set to ALL', () => {
                const result = layerEdit(
                    { programStatus: 'ACTIVE' },
                    {
                        type: types.LAYER_EDIT_PROGRAM_STATUS_SET,
                        payload: 'ALL',
                    }
                )

                expect(result.programStatus).toBeUndefined()
            })

            it('sets programStatus for any other value', () => {
                const result = layerEdit(
                    {},
                    {
                        type: types.LAYER_EDIT_PROGRAM_STATUS_SET,
                        payload: 'ACTIVE',
                    }
                )

                expect(result.programStatus).toBe('ACTIVE')
            })
        })

        it('sets followUp status', () => {
            const result = layerEdit(
                {},
                { type: types.LAYER_EDIT_FOLLOW_UP_SET, payload: true }
            )

            expect(result.followUp).toBe(true)
        })

        it('sets feature style, merging with any existing style', () => {
            const result = layerEdit(
                { featureStyle: { color: '#000' } },
                {
                    type: types.LAYER_EDIT_FEATURE_STYLE_SET,
                    payload: { weight: 2 },
                }
            )

            expect(result.featureStyle).toEqual({ color: '#000', weight: 2 })
        })
    })

    it('returns the current state for unknown actions', () => {
        const state = { id: 'layer1' }

        expect(layerEdit(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
