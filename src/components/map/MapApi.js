import MapApi, {
    layerTypes,
    controlTypes,
    loadEarthEngineApi,
    poleOfInaccessibility,
} from '@dhis2/maps-gl';
import getMapLocale from './mapLocale';

// Returns a new map instance
const map = options => {
    const baseUrl = process.env.DHIS2_BASE_URL;
    const glyphs = `${baseUrl}/dhis-web-maps/fonts/{fontstack}/{range}.pbf`;
    const div = document.createElement('div');

    div.className = 'dhis2-map';
    div.style.width = '100%';
    div.style.height = '100%';

    const mapInstance = new MapApi(div, {
        ...options,
        locale: getMapLocale(),
        glyphs,
    });

    return mapInstance;
};

export { layerTypes, controlTypes, loadEarthEngineApi, poleOfInaccessibility };

export default map;
