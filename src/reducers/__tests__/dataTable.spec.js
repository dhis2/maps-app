import * as types from '../../constants/actionTypes.js'
import dataTable from '../dataTable.js'

const initialState = {
    openIds: [],
    combinedView: false,
}

describe('dataTable reducer', () => {
    it('returns the initial state by default', () => {
        expect(dataTable(undefined, {})).toEqual(initialState)
    })

    it.each([
        types.MAP_NEW,
        types.MAP_SET,
        types.DATA_TABLE_CLOSE,
        types.DOWNLOAD_MODE_CLOSE,
        types.DOWNLOAD_MODE_OPEN,
    ])('resets fully to the initial state on %s', (type) => {
        const state = { openIds: ['layer1', 'layer2'], combinedView: true }

        expect(dataTable(state, { type })).toEqual(initialState)
    })

    describe('DATA_TABLE_TOGGLE', () => {
        it('opens a layer tab that was not open', () => {
            const state = dataTable(initialState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })

            expect(state.openIds).toEqual(['layer1'])
        })

        it('appends to openIds without closing other tabs', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1'] },
                { type: types.DATA_TABLE_TOGGLE, id: 'layer2' }
            )

            expect(state.openIds).toEqual(['layer1', 'layer2'])
        })

        it('closes an already-open tab', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1', 'layer2'] },
                { type: types.DATA_TABLE_TOGGLE, id: 'layer1' }
            )

            expect(state.openIds).toEqual(['layer2'])
        })

        it('leaves combinedView untouched even when closing the last open tab', () => {
            const prevState = { openIds: ['layer1'], combinedView: true }

            const state = dataTable(prevState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })

            expect(state.openIds).toEqual([])
            expect(state.combinedView).toBe(true)
        })
    })

    describe('LAYER_REMOVE', () => {
        it('removes the layer from openIds', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1', 'layer2'] },
                { type: types.LAYER_REMOVE, id: 'layer1' }
            )

            expect(state.openIds).toEqual(['layer2'])
        })

        it('leaves combinedView untouched', () => {
            const prevState = { openIds: [], combinedView: true }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
                combinedLayerKey: 'layer1Key',
            })

            expect(state.combinedView).toBe(true)
        })
    })

    describe('DATA_TABLE_COMBINED_VIEW_TOGGLE', () => {
        it('turns combinedView on', () => {
            const state = dataTable(initialState, {
                type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE,
            })

            expect(state.combinedView).toBe(true)
        })

        it('turns combinedView off', () => {
            const state = dataTable(
                { ...initialState, combinedView: true },
                { type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE }
            )

            expect(state.combinedView).toBe(false)
        })
    })

    it('returns the current state for unknown actions', () => {
        const state = { ...initialState, openIds: ['layer1'] }

        expect(dataTable(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
