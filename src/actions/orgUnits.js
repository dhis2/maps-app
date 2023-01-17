import log from 'loglevel'
import * as types from '../constants/actionTypes.js'
import { fetchOrgUnits } from '../util/requests.js'

// Load organisation unit tree
export const loadOrgUnitTree = () => ({
    type: types.ORGANISATION_UNIT_TREE_LOAD,
})

// set organisation unit tree
export const setOrgUnitTree = (rootModel) => ({
    type: types.ORGANISATION_UNIT_TREE_SET,
    payload: rootModel,
})

// Load all organisation unit groups sets
export const loadOrgUnitGroupSets = () => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_LOAD,
})

// Set all organisation unit groups sets
export const setOrgUnitGroupSets = (data) => ({
    type: types.ORGANISATION_UNIT_GROUP_SETS_SET,
    payload: data,
})

export const setOrgUnitProfile = (id) => ({
    type: types.ORGANISATION_UNIT_PROFILE_SET,
    payload: id,
})

export const closeOrgUnitProfile = () => ({
    type: types.ORGANISATION_UNIT_PROFILE_CLOSE,
})

export const tSetOrgUnitTree = () => async (dispatch) => {
    try {
        const orgUnitTree = await fetchOrgUnits()
        dispatch(setOrgUnitTree(orgUnitTree))
    } catch (e) {
        log.error('Could not load organisation unit tree')
        return e
    }
}
