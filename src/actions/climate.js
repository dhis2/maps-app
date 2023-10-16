import * as types from '../constants/actionTypes.js'

export const openClimatePanel = (payload) => ({
    type: types.CLIMATE_PANEL_OPEN,
    payload,
})

export const closeClimatePanel = () => ({
    type: types.CLIMATE_PANEL_CLOSE,
})
