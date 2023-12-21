import log from 'loglevel';
import * as types from '../constants/actionTypes';
import { getFallbackBasemap } from '../constants/basemaps';
import { fetchMap, dataStatisticsMutation } from '../util/requests';
import { addOrgUnitPaths } from '../util/helpers';
import { loadLayer } from './layers';

export const newMap = () => ({
    type: types.MAP_NEW,
});

export const setMap = config => ({
    type: types.MAP_SET,
    payload: config,
});

export const setMapProps = props => ({
    type: types.MAP_PROPS_SET,
    payload: props,
});

export const openCoordinatePopup = coord => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
});

export const closeCoordinatePopup = () => ({
    type: types.MAP_COORDINATE_CLOSE,
});

export const openContextMenu = payload => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
});

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
});

export const showEarthEngineValue = (layerId, coordinate) => ({
    type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
    layerId,
    coordinate,
});

export const tOpenMap = (mapId, keyDefaultBaseMap, dataEngine) => async (
    dispatch,
    getState
) => {
    try {
        const map = await fetchMap(mapId, dataEngine, keyDefaultBaseMap);

        // record map view
        dataEngine.mutate(dataStatisticsMutation, {
            variables: { id: mapId },
            onError: error => log.error('Error: ', error),
        });

        const basemapConfig =
            getState().basemaps.find(bm => bm.id === map.basemap.id) ||
            getFallbackBasemap();

        const basemap = { ...map.basemap, ...basemapConfig };

        dispatch(setMap({ ...map, basemap }));
        addOrgUnitPaths(map.mapViews).map(view => dispatch(loadLayer(view)));
    } catch (e) {
        log.error(e);
        return e;
    }
};
