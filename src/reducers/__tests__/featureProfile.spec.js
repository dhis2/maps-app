import * as types from '../../constants/actionTypes.js'
import featureProfile from '../featureProfile.js'

describe('featureProfile reducer', () => {
    it('returns null by default', () => {
        expect(featureProfile(undefined, {})).toBe(null)
    })

    it('sets the feature profile', () => {
        const payload = { id: 'feat1' }

        expect(
            featureProfile(null, {
                type: types.FEATURE_PROFILE_SET,
                payload,
            })
        ).toBe(payload)
    })

    it.each([
        types.FEATURE_PROFILE_CLOSE,
        types.ORGANISATION_UNIT_PROFILE_SET,
        types.INTERPRETATIONS_PANEL_OPEN,
        types.MAP_NEW,
        types.MAP_SET,
    ])('clears the feature profile on %s', (type) => {
        expect(featureProfile({ id: 'feat1' }, { type })).toBe(null)
    })

    it('returns the current state for unknown actions', () => {
        const state = { id: 'feat1' }

        expect(featureProfile(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
