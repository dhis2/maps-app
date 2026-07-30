import * as types from '../../constants/actionTypes.js'
import {
    closeDataTable,
    toggleDataTable,
    resizeDataTable,
    setActiveTimelinePeriod,
    toggleCombinedView,
    setJoinConfig,
    setCombinedColumnConfig,
} from '../dataTable.js'

describe('closeDataTable', () => {
    it('creates a DATA_TABLE_CLOSE action', () => {
        expect(closeDataTable()).toEqual({
            type: types.DATA_TABLE_CLOSE,
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

describe('resizeDataTable', () => {
    it('creates a DATA_TABLE_RESIZE action', () => {
        expect(resizeDataTable(300)).toEqual({
            type: types.DATA_TABLE_RESIZE,
            height: 300,
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
        const layers = {
            layer1: { type: 'orgUnit', aggregation: {} },
        }
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
