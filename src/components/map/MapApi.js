import MapApi, { layerTypes, controlTypes } from '@dhis2/gis-api';
import i18n from '@dhis2/d2-i18n';
// import MapApi, { layerTypes, controlTypes } from '@dhis2/maps-gl';

const getMapLocale = () => ({
    'FullscreenControl.Enter': i18n.t('Enter fullscreen'),
    'FullscreenControl.Exit': i18n.t('Exit fullscreen'),
    'NavigationControl.ResetBearing': i18n.t('Reset bearing to north'),
    'NavigationControl.ZoomIn': i18n.t('Zoom in'),
    'NavigationControl.ZoomOut': i18n.t('Zoom out'),
    'SearchControl.SearchForPlace': i18n.t('Search for place or address'),
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
