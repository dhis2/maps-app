import * as types from '../../constants/actionTypes.js'
import dataTable from '../dataTable.js'

const initialState = {
    openIds: [],
    combinedView: false,
    isPanelVisible: false,
    activeLayerId: null,
}

describe('dataTable reducer', () => {
    it('returns the initial state by default', () => {
        expect(dataTable(undefined, {})).toEqual(initialState)
    })

    it.each([
        types.MAP_NEW,
        types.MAP_SET,
        types.DOWNLOAD_MODE_CLOSE,
        types.DOWNLOAD_MODE_OPEN,
    ])('resets fully to the initial state on %s', (type) => {
        const state = {
            openIds: ['layer1', 'layer2'],
            combinedView: true,
            isPanelVisible: true,
            activeLayerId: 'layer1',
        }

        expect(dataTable(state, { type })).toEqual(initialState)
    })

    describe('DATA_TABLE_CLOSE', () => {
        it('hides the panel without touching openIds, combinedView, or activeLayerId', () => {
            const state = {
                openIds: ['layer1', 'layer2'],
                combinedView: true,
                isPanelVisible: true,
                activeLayerId: 'layer1',
            }

            const nextState = dataTable(state, { type: types.DATA_TABLE_CLOSE })

            expect(nextState).toEqual({ ...state, isPanelVisible: false })
        })
    })

    describe('DATA_TABLE_OPEN', () => {
        it('shows the panel without touching openIds, combinedView, or activeLayerId', () => {
            const state = {
                openIds: ['layer1'],
                combinedView: false,
                isPanelVisible: false,
                activeLayerId: 'layer1',
            }

            const nextState = dataTable(state, { type: types.DATA_TABLE_OPEN })

            expect(nextState).toEqual({ ...state, isPanelVisible: true })
        })
    })

    describe('DATA_TABLE_ACTIVE_LAYER_SET', () => {
        it('sets activeLayerId', () => {
            const state = dataTable(initialState, {
                type: types.DATA_TABLE_ACTIVE_LAYER_SET,
                id: 'layer1',
            })

            expect(state.activeLayerId).toBe('layer1')
        })
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
            const prevState = {
                ...initialState,
                openIds: ['layer1'],
                combinedView: true,
            }

            const state = dataTable(prevState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })

            expect(state.openIds).toEqual([])
            expect(state.combinedView).toBe(true)
        })

        it('makes the panel visible when opening a tab, even from a hidden state', () => {
            const state = dataTable(
                { ...initialState, isPanelVisible: false },
                { type: types.DATA_TABLE_TOGGLE, id: 'layer1' }
            )

            expect(state.isPanelVisible).toBe(true)
        })

        it('does not forcibly clear panel visibility when closing a tab', () => {
            const prevState = {
                ...initialState,
                openIds: ['layer1'],
                isPanelVisible: true,
            }

            const state = dataTable(prevState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })

            expect(state.isPanelVisible).toBe(true)
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
            const prevState = { ...initialState, combinedView: true }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
                combinedLayerKey: 'layer1Key',
            })

            expect(state.combinedView).toBe(true)
        })

        it('clears activeLayerId when the removed layer was the active one', () => {
            const prevState = {
                ...initialState,
                openIds: ['layer1'],
                activeLayerId: 'layer1',
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
            })

            expect(state.activeLayerId).toBeNull()
        })

        it('leaves activeLayerId untouched when a different layer is removed', () => {
            const prevState = {
                ...initialState,
                openIds: ['layer1', 'layer2'],
                activeLayerId: 'layer1',
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer2',
            })

            expect(state.activeLayerId).toBe('layer1')
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

        it('makes the panel visible when turning combinedView on, even from a hidden state', () => {
            const state = dataTable(
                { ...initialState, isPanelVisible: false },
                { type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE }
            )

            expect(state.isPanelVisible).toBe(true)
        })

        it('does not forcibly clear panel visibility when turning combinedView off', () => {
            const prevState = {
                ...initialState,
                combinedView: true,
                isPanelVisible: true,
            }

            const state = dataTable(prevState, {
                type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE,
            })

            expect(state.isPanelVisible).toBe(true)
        })
    })

    it('returns the current state for unknown actions', () => {
        const state = { ...initialState, openIds: ['layer1'] }

        expect(dataTable(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
