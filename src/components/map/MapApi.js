import MapApi, {
    layerTypes,
    controlTypes,
    loadEarthEngineApi,
    loadEarthEngineWorker,
    poleOfInaccessibility,
} from '@dhis2/maps-gl';
import getMapLocale from './mapLocale';

// Returns a new map instance
const map = options => {
    const div = document.createElement('div');

    div.className = 'dhis2-map';
    div.style.width = '100%';
    div.style.height = '100%';

    return new MapApi(div, {
        ...options,
        locale: getMapLocale(),
    });
};

export {
    layerTypes,
    controlTypes,
    loadEarthEngineApi,
    loadEarthEngineWorker,
    poleOfInaccessibility,
};

export default map;
