import * as types from '../../constants/actionTypes.js'
import { setDataFilter, clearDataFilter } from '../dataFilters.js'

describe('setDataFilter', () => {
    it('creates a DATA_FILTER_SET action', () => {
        const filter = { operator: 'eq', value: 1 }

        expect(setDataFilter('layer1', 'field1', filter)).toEqual({
            type: types.DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'field1',
            filter,
        })
    })
})

describe('clearDataFilter', () => {
    it('creates a DATA_FILTER_CLEAR action', () => {
        expect(clearDataFilter('layer1', 'field1')).toEqual({
            type: types.DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'field1',
        })
    })
})
