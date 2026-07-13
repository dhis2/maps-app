import * as types from '../../constants/actionTypes.js'
import map from '../map.js'

// The Layers panel renders overlay layers in the REVERSE of `mapViews`
// order (top of the panel = last map view). dnd-kit's onDragEnd therefore
// reports oldIndex/newIndex in that reversed "display" space, and the
// LAYER_SORT reducer is responsible for translating a reorder in display
// space back into the stored `mapViews` order. These tests pin down that
// contract so the dnd-kit migration cannot silently reorder layers wrong.
describe('map reducer - LAYER_SORT', () => {
    const layer = (id) => ({ id })

    // stored order [A, B, C]  ->  displayed (reversed) order [C, B, A]
    const stateWith = (...ids) => ({
        mapViews: ids.map(layer),
    })

    const displayedIds = (state) =>
        [...state.mapViews].reverse().map((mv) => mv.id)

    it('moving the top layer to the bottom (display space) reorders mapViews', () => {
        // displayed: [C, B, A]  -> drag C (index 0) down to index 2 -> [B, A, C]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 0,
            newIndex: 2,
        })

        expect(displayedIds(result)).toEqual(['B', 'A', 'C'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['C', 'A', 'B'])
    })

    it('moving the bottom layer to the top (display space) reorders mapViews', () => {
        // displayed: [C, B, A]  -> drag A (index 2) up to index 0 -> [A, C, B]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 2,
            newIndex: 0,
        })

        expect(displayedIds(result)).toEqual(['A', 'C', 'B'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['B', 'C', 'A'])
    })

    it('swapping two adjacent layers in display space swaps them in mapViews', () => {
        // displayed: [C, B, A]  -> drag B (index 1) up to index 0 -> [B, C, A]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 1,
            newIndex: 0,
        })

        expect(displayedIds(result)).toEqual(['B', 'C', 'A'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['A', 'C', 'B'])
    })

    it('is a no-op when oldIndex === newIndex', () => {
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 1,
            newIndex: 1,
        })

        expect(result.mapViews.map((mv) => mv.id)).toEqual(['A', 'B', 'C'])
    })

    it('does not mutate the original state', () => {
        const state = stateWith('A', 'B', 'C')
        const before = state.mapViews

        map(state, { type: types.LAYER_SORT, oldIndex: 0, newIndex: 2 })

        expect(state.mapViews).toBe(before)
        expect(state.mapViews.map((mv) => mv.id)).toEqual(['A', 'B', 'C'])
    })
})
