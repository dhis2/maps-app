import * as types from '../../constants/actionTypes.js'
import savedMap from '../savedMap.js'

describe('savedMap reducer', () => {
    it('defaults to null', () => {
        expect(savedMap(undefined, { type: '@@INIT' })).toBe(null)
    })

    it('MAP_SET replaces state with the payload', () => {
        const payload = { id: 'abc', name: 'My map', mapViews: [] }

        expect(savedMap({ id: 'old' }, { type: types.MAP_SET, payload })).toBe(
            payload
        )
    })

    it('MAP_NEW resets to null', () => {
        const state = { id: 'abc', name: 'My map', mapViews: [] }

        expect(savedMap(state, { type: types.MAP_NEW })).toBe(null)
    })

    it('MAP_PROPS_SET merges props into the current snapshot', () => {
        const state = { id: 'abc', name: 'Old name', mapViews: [] }

        const result = savedMap(state, {
            type: types.MAP_PROPS_SET,
            payload: { name: 'New name', displayName: 'New name' },
        })

        expect(result).toEqual({
            id: 'abc',
            name: 'New name',
            displayName: 'New name',
            mapViews: [],
        })
    })

    it('MAP_PROPS_SET is a no-op when there is no saved snapshot yet', () => {
        expect(
            savedMap(null, {
                type: types.MAP_PROPS_SET,
                payload: { name: 'New name' },
            })
        ).toBe(null)
    })

    it('returns the same state for unrelated actions', () => {
        const state = { id: 'abc', mapViews: [] }

        expect(savedMap(state, { type: types.DATA_TABLE_TOGGLE })).toBe(state)
    })
})
