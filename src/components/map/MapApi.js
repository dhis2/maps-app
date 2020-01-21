import MapApi, { layerTypes } from '@dhis2/gis-api';
// import MapApi, { layerTypes } from '@dhis2/maps-gl';

// Returns a new map instance
const map = options => {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    return new MapApi(div, options);
};

export { layerTypes };

export default map;
