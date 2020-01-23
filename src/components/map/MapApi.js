import MapApi, { layerTypes, controlTypes } from '@dhis2/gis-api';
// import MapApi, { layerTypes, controlTypes } from '@dhis2/maps-gl';
import i18n from '@dhis2/d2-i18n';

const getMapLocale = () => ({
    'Enter fullscreen': i18n.t('Enter fullscreen'),
    'Exit fullscreen': i18n.t('Exit fullscreen'),
    'Reset bearing to north': i18n.t('Reset bearing to north'),
    'Zoom in': i18n.t('Zoom in'),
    'Zoom out': i18n.t('Zoom out'),
    'Zoom to content': i18n.t('Zoom to content'),
    'Search for place or address': i18n.t('Search for place or address'),
    'Measure distance and area': i18n.t('Measure distance and area'),
});

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
