import * as types from '../../constants/actionTypes.js'
import interpretation from '../interpretation.js'

describe('interpretation reducer', () => {
    it('returns an empty object by default', () => {
        expect(interpretation(undefined, {})).toEqual({})
    })

    it('sets the interpretation id', () => {
        const result = interpretation(
            { id: 'old' },
            { type: types.INTERPRETATION_SET, payload: 'int1' }
        )

        expect(result).toEqual({ id: 'int1' })
    })

    it('returns the current state for unknown actions', () => {
        const state = { id: 'int1' }

        expect(interpretation(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
