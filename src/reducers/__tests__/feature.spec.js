import * as types from '../../constants/actionTypes.js'
import feature from '../feature.js'

describe('feature reducer', () => {
    it('returns null by default', () => {
        expect(feature(undefined, {})).toBe(null)
    })

    it('replaces state with a copy of the highlighted feature', () => {
        const payload = { id: 'feat1' }

        const result = feature(null, {
            type: types.FEATURE_HIGHLIGHT,
            payload,
        })

        expect(result).toEqual(payload)
        expect(result).not.toBe(payload)
    })

    it('returns null when highlighting a falsy feature', () => {
        const result = feature(
            { id: 'feat1' },
            { type: types.FEATURE_HIGHLIGHT, payload: null }
        )

        expect(result).toBe(null)
    })

    it('returns the current state for unknown actions', () => {
        const state = { id: 'feat1' }

        expect(feature(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
