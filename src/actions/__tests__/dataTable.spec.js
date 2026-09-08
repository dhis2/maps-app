import * as types from '../../constants/actionTypes.js'
import {
    closeDataTable,
    openDataTable,
    toggleDataTable,
    setActiveDataTableLayer,
    resizeDataTable,
    setMapBounds,
    toggleShowOnlyFeaturesInView,
    setSelectionFilter,
    setHighlightColor,
    setDataTableColumnConfig,
    setActiveTimelinePeriod,
    toggleCombinedView,
    setJoinConfig,
    setCombinedColumnConfig,
    setCombinedVisibleIds,
} from '../dataTable.js'

describe('closeDataTable', () => {
    it('creates a DATA_TABLE_CLOSE action', () => {
        expect(closeDataTable()).toEqual({
            type: types.DATA_TABLE_CLOSE,
        })
    })
})

describe('openDataTable', () => {
    it('creates a DATA_TABLE_OPEN action', () => {
        expect(openDataTable()).toEqual({
            type: types.DATA_TABLE_OPEN,
        })
    })
})

describe('toggleDataTable', () => {
    it('creates a DATA_TABLE_TOGGLE action', () => {
        expect(toggleDataTable('layer1')).toEqual({
            type: types.DATA_TABLE_TOGGLE,
            id: 'layer1',
        })
    })
})

describe('setActiveDataTableLayer', () => {
    it('creates a DATA_TABLE_ACTIVE_LAYER_SET action', () => {
        expect(setActiveDataTableLayer('layer1')).toEqual({
            type: types.DATA_TABLE_ACTIVE_LAYER_SET,
            id: 'layer1',
        })
    })
})

describe('resizeDataTable', () => {
    it('creates a DATA_TABLE_RESIZE action', () => {
        expect(resizeDataTable(300)).toEqual({
            type: types.DATA_TABLE_RESIZE,
            height: 300,
        })
    })
})

describe('setMapBounds', () => {
    it('creates a MAP_BOUNDS_CHANGED action', () => {
        const bounds = [
            [0, 0],
            [1, 1],
        ]
        expect(setMapBounds(bounds)).toEqual({
            type: types.MAP_BOUNDS_CHANGED,
            bounds,
        })
    })
})

describe('toggleShowOnlyFeaturesInView', () => {
    it('creates a TOGGLE_SHOW_ONLY_IN_VIEW action', () => {
        expect(toggleShowOnlyFeaturesInView()).toEqual({
            type: types.TOGGLE_SHOW_ONLY_IN_VIEW,
        })
    })
})

describe('setSelectionFilter', () => {
    it('creates a SELECTION_FILTER_SET action', () => {
        expect(setSelectionFilter(['selected'])).toEqual({
            type: types.SELECTION_FILTER_SET,
            value: ['selected'],
        })
    })
})

describe('setHighlightColor', () => {
    it('creates a HIGHLIGHT_COLOR_SET action', () => {
        expect(setHighlightColor('#ff0000')).toEqual({
            type: types.HIGHLIGHT_COLOR_SET,
            color: '#ff0000',
        })
    })
})

describe('setDataTableColumnConfig', () => {
    it('creates a DATA_TABLE_COLUMN_CONFIG_SET action', () => {
        const config = { pinnedKeys: ['name'] }
        expect(setDataTableColumnConfig('layer1', config)).toEqual({
            type: types.DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config,
        })
    })
})

describe('setActiveTimelinePeriod', () => {
    it('creates an ACTIVE_TIMELINE_PERIOD_SET action', () => {
        const period = { id: '202301', name: 'January 2023' }
        expect(setActiveTimelinePeriod(period)).toEqual({
            type: types.ACTIVE_TIMELINE_PERIOD_SET,
            period,
        })
    })
})

describe('toggleCombinedView', () => {
    it('creates a DATA_TABLE_COMBINED_VIEW_TOGGLE action', () => {
        expect(toggleCombinedView()).toEqual({
            type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE,
        })
    })
})

describe('setJoinConfig', () => {
    it('creates a DATA_TABLE_JOIN_CONFIG_SET action', () => {
        const layers = { layer1: { type: 'orgUnit', aggregation: {} } }
        expect(setJoinConfig('ref1', layers)).toEqual({
            type: types.DATA_TABLE_JOIN_CONFIG_SET,
            layerId: 'ref1',
            layers,
        })
    })
})

describe('setCombinedColumnConfig', () => {
    it('creates a DATA_TABLE_COMBINED_COLUMN_CONFIG_SET action', () => {
        const config = { pinnedKeys: ['name'] }
        expect(setCombinedColumnConfig('ref1', config)).toEqual({
            type: types.DATA_TABLE_COMBINED_COLUMN_CONFIG_SET,
            layerId: 'ref1',
            config,
        })
    })
})

describe('setCombinedVisibleIds', () => {
    it('creates a COMBINED_VISIBLE_IDS_SET action', () => {
        const idsByLayer = { layer1: ['a', 'b'] }
        expect(setCombinedVisibleIds(idsByLayer)).toEqual({
            type: types.COMBINED_VISIBLE_IDS_SET,
            idsByLayer,
        })
    })
})
