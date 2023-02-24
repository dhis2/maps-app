import log from 'loglevel'
import * as types from '../constants/actionTypes.js'
import { getFallbackBasemap } from '../constants/basemaps.js'
import { addOrgUnitPaths } from '../util/helpers.js'
import { fetchMap } from '../util/requests.js'

export const newMap = () => ({
    type: types.MAP_NEW,
})

export const setMap = (config) => ({
    type: types.MAP_SET,
    payload: config,
})

export const setMapProps = (props) => ({
    type: types.MAP_PROPS_SET,
    payload: props,
})

export const openCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
})

export const closeCoordinatePopup = () => ({
    type: types.MAP_COORDINATE_CLOSE,
})

export const openContextMenu = (payload) => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
})

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
})

export const showEarthEngineValue = (layerId, coordinate) => ({
    type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
    layerId,
    coordinate,
})

export const clearAlerts = () => ({
    type: types.MAP_ALERTS_CLEAR,
})

export const tOpenMap =
    (mapId, keyDefaultBaseMap, dataEngine) => async (dispatch, getState) => {
        try {
            const map = await fetchMap(mapId, dataEngine, keyDefaultBaseMap)

            const basemapConfig =
                getState().basemaps.find((bm) => bm.id === map.basemap.id) ||
                getFallbackBasemap()

            const basemap = { ...map.basemap, ...basemapConfig }

            dispatch(
                setMap({
                    ...map,
                    mapViews: addOrgUnitPaths(map.mapViews),
                    basemap,
                })
            )
        } catch (e) {
            log.error(e)
            return e
        }
    }
