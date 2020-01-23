import MapApi, { layerTypes, controlTypes } from '@dhis2/gis-api';
// import MapApi, { layerTypes, controlTypes } from '@dhis2/maps-gl';
import i18n from '@dhis2/d2-i18n';

const mapLocale = [
    'Enter fullscreen',
    'Exit fullscreen',
    'Reset bearing to north',
    'Zoom in',
    'Zoom out',
    'Zoom to content',
    'Search for place or address',
    'Measure distance and area',
];

const getMapLocale = () =>
    mapLocale.reduce((loc, str) => {
        loc[str] = i18n.t(str);
        return loc;
    }, {});

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

export { layerTypes, controlTypes };

export default map;
