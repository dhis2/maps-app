import * as types from '../../constants/actionTypes.js'
import {
    closeDataTable,
    openDataTable,
    toggleDataTable,
    setActiveDataTableLayer,
    resizeDataTable,
    setActiveTimelinePeriod,
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

describe('setActiveTimelinePeriod', () => {
    it('creates an ACTIVE_TIMELINE_PERIOD_SET action', () => {
        const period = { id: '202301', name: 'January 2023' }
        expect(setActiveTimelinePeriod(period)).toEqual({
            type: types.ACTIVE_TIMELINE_PERIOD_SET,
            period,
        })
    })
})
