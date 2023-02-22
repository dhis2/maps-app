import * as types from '../constants/actionTypes.js'

export const setOrgUnitProfile = (id) => ({
    type: types.ORGANISATION_UNIT_PROFILE_SET,
    payload: id,
})

export const closeOrgUnitProfile = () => ({
    type: types.ORGANISATION_UNIT_PROFILE_CLOSE,
})
