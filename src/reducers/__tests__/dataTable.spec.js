import * as types from '../../constants/actionTypes.js'
import dataTable from '../dataTable.js'

describe('dataTable reducer', () => {
    it('returns null by default', () => {
        expect(dataTable(undefined, {})).toBe(null)
    })

    it.each([
        types.DATA_TABLE_CLOSE,
        types.MAP_NEW,
        types.MAP_SET,
        types.DOWNLOAD_MODE_CLOSE,
        types.DOWNLOAD_MODE_OPEN,
    ])('clears the open data table on %s', (type) => {
        expect(dataTable('layer1', { type })).toBe(null)
    })

    it('closes the data table when toggling the currently open layer', () => {
        expect(
            dataTable('layer1', {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })
        ).toBe(null)
    })

    it('opens the data table when toggling a different layer', () => {
        expect(
            dataTable('layer1', {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer2',
            })
        ).toBe('layer2')
    })

    it('clears the open data table when its layer is removed', () => {
        expect(
            dataTable('layer1', { type: types.LAYER_REMOVE, id: 'layer1' })
        ).toBe(null)
    })

    it('keeps the open data table when a different layer is removed', () => {
        expect(
            dataTable('layer1', { type: types.LAYER_REMOVE, id: 'layer2' })
        ).toBe('layer1')
    })

    it('returns the current state for unknown actions', () => {
        expect(dataTable('layer1', { type: 'UNKNOWN' })).toBe('layer1')
    })
})
