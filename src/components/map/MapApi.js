import MapApi, {
    layerTypes,
    controlTypes,
    loadEarthEngineApi,
} from '@dhis2/gis-api';
import getMapLocale from './mapLocale';

// Returns a new map instance
const map = options => {
    const div = document.createElement('div');

    div.style.width = '100%';
    div.style.height = '100%';

    return new MapApi(div, {
        ...options,
        locale: getMapLocale(),
    });
};

export { layerTypes, controlTypes, loadEarthEngineApi };

export default map;
