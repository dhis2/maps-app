import * as types from '../../constants/actionTypes.js'
import { setOrgUnitProfile, closeOrgUnitProfile } from '../orgUnits.js'

describe('setOrgUnitProfile', () => {
    it('creates an ORGANISATION_UNIT_PROFILE_SET action', () => {
        expect(setOrgUnitProfile('ou1')).toEqual({
            type: types.ORGANISATION_UNIT_PROFILE_SET,
            payload: 'ou1',
        })
    })
})

describe('closeOrgUnitProfile', () => {
    it('creates an ORGANISATION_UNIT_PROFILE_CLOSE action', () => {
        expect(closeOrgUnitProfile()).toEqual({
            type: types.ORGANISATION_UNIT_PROFILE_CLOSE,
        })
    })
})
