import * as types from '../../constants/actionTypes.js'
import analyticalObject from '../analyticalObject.js'

describe('analyticalObject reducer', () => {
    it('returns null by default', () => {
        expect(analyticalObject(undefined, {})).toBe(null)
    })

    it('sets the analytical object', () => {
        const payload = { id: 'ao1' }

        expect(
            analyticalObject(null, {
                type: types.ANALYTICAL_OBJECT_SET,
                payload,
            })
        ).toBe(payload)
    })

    it('clears the analytical object', () => {
        expect(
            analyticalObject(
                { id: 'ao1' },
                { type: types.ANALYTICAL_OBJECT_CLEAR }
            )
        ).toBe(null)
    })

    it('returns the current state for unknown actions', () => {
        const state = { id: 'ao1' }

        expect(analyticalObject(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
