import * as types from '../../constants/actionTypes.js'
import orgUnitProfile from '../orgUnitProfile.js'

describe('orgUnitProfile reducer', () => {
    it('returns null by default', () => {
        expect(orgUnitProfile(undefined, {})).toBe(null)
    })

    it('sets the org unit profile', () => {
        const payload = 'ou1'

        expect(
            orgUnitProfile(null, {
                type: types.ORGANISATION_UNIT_PROFILE_SET,
                payload,
            })
        ).toBe(payload)
    })

    it.each([
        types.ORGANISATION_UNIT_PROFILE_CLOSE,
        types.FEATURE_PROFILE_SET,
        types.INTERPRETATIONS_PANEL_OPEN,
        types.DOWNLOAD_MODE_CLOSE,
        types.MAP_NEW,
        types.MAP_SET,
    ])('clears the org unit profile on %s', (type) => {
        expect(orgUnitProfile('ou1', { type })).toBe(null)
    })

    it('returns the current state for unknown actions', () => {
        expect(orgUnitProfile('ou1', { type: 'UNKNOWN' })).toBe('ou1')
    })
})
