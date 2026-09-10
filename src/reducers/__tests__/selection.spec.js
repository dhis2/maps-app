import * as types from '../../constants/actionTypes.js'
import selection from '../selection.js'

describe('selection reducer', () => {
    it('returns the default state', () => {
        expect(selection(undefined, {})).toEqual({ layerId: null, ids: [] })
    })

    it('selects a single feature on a fresh layer', () => {
        const state = selection(undefined, {
            type: types.FEATURE_TOGGLE_SELECTION,
            id: 'a',
            layerId: 'layer-1',
        })

        expect(state).toEqual({ layerId: 'layer-1', ids: ['a'] })
    })

    it('adds a feature to the existing selection on the same layer', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a'] },
            {
                type: types.FEATURE_TOGGLE_SELECTION,
                id: 'b',
                layerId: 'layer-1',
            }
        )

        expect(state).toEqual({ layerId: 'layer-1', ids: ['a', 'b'] })
    })

    it('removes an already-selected feature (toggle off)', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            {
                type: types.FEATURE_TOGGLE_SELECTION,
                id: 'a',
                layerId: 'layer-1',
            }
        )

        expect(state).toEqual({ layerId: 'layer-1', ids: ['b'] })
    })

    it('replaces the selection with a fresh single id when toggling on a different layer', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            {
                type: types.FEATURE_TOGGLE_SELECTION,
                id: 'c',
                layerId: 'layer-2',
            }
        )

        expect(state).toEqual({ layerId: 'layer-2', ids: ['c'] })
    })

    it('sets the full selection in one action for "select all"', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a'] },
            {
                type: types.SELECTION_SET_ALL,
                ids: ['a', 'b', 'c'],
                layerId: 'layer-1',
            }
        )

        expect(state).toEqual({ layerId: 'layer-1', ids: ['a', 'b', 'c'] })
    })

    it('adds a range of ids to the existing selection on the same layer (Shift+Click)', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a'] },
            {
                type: types.SELECTION_ADD_RANGE,
                ids: ['b', 'c', 'd'],
                layerId: 'layer-1',
            }
        )

        expect(state).toEqual({ layerId: 'layer-1', ids: ['a', 'b', 'c', 'd'] })
    })

    it('dedupes ids already present when adding a range', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            {
                type: types.SELECTION_ADD_RANGE,
                ids: ['b', 'c'],
                layerId: 'layer-1',
            }
        )

        expect(state).toEqual({ layerId: 'layer-1', ids: ['a', 'b', 'c'] })
    })

    it('starts a fresh selection when adding a range on a different layer', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            {
                type: types.SELECTION_ADD_RANGE,
                ids: ['x', 'y'],
                layerId: 'layer-2',
            }
        )

        expect(state).toEqual({ layerId: 'layer-2', ids: ['x', 'y'] })
    })

    it.each([
        types.SELECTION_CLEAR,
        types.MAP_NEW,
        types.MAP_SET,
        types.DATA_TABLE_CLOSE,
        types.DATA_TABLE_TOGGLE,
    ])('resets to default state on %s', (type) => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            { type }
        )

        expect(state).toEqual({ layerId: null, ids: [] })
    })

    it('resets to default state when the selected layer is removed', () => {
        const state = selection(
            { layerId: 'layer-1', ids: ['a', 'b'] },
            { type: types.LAYER_REMOVE, id: 'layer-1' }
        )

        expect(state).toEqual({ layerId: null, ids: [] })
    })

    it('keeps the selection when a different layer is removed', () => {
        const prevState = { layerId: 'layer-1', ids: ['a', 'b'] }
        const state = selection(prevState, {
            type: types.LAYER_REMOVE,
            id: 'layer-2',
        })

        expect(state).toBe(prevState)
    })

    it('ignores unrelated actions', () => {
        const prevState = { layerId: 'layer-1', ids: ['a'] }

        expect(selection(prevState, { type: 'UNRELATED' })).toBe(prevState)
    })
})
