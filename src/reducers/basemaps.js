import * as types from '../constants/actionTypes';

const defaultBasemaps = [{
    id: 'osmLight',
    title: 'OSM Light',
    subtitle: 'Basemap',
    img: 'images/layers/osmlight.png',
    config: {
        type: 'tileLayer',
        url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    },
},{
    id: 'openStreetMap',
    title: 'OSM Detailed',
    subtitle: 'Basemap',
    img: 'images/layers/osm.png',
    config: {
        type: 'tileLayer',
        url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
},{
    id: 'googleStreets',
    title: 'Google Streets',
    subtitle: 'Basemap',
    img: 'images/layers/googlestreets.png',
    config: {
        type: 'googleLayer',
        style: 'ROADMAP',
        apiKey: 'AIzaSyBjlDmwuON9lJbPMDlh_LI3zGpGtpK9erc',
    },
},{
    id: 'googleHybrid',
    title: 'Google Hybrid',
    subtitle: 'Basemap',
    img: 'images/layers/googlehybrid.jpeg',
    config: {
        type: 'googleLayer',
        style: 'HYBRID',
        apiKey: 'AIzaSyBjlDmwuON9lJbPMDlh_LI3zGpGtpK9erc',
    },
}];

const basemaps = (state = defaultBasemaps, action) => {

    switch (action.type) {

        case types.BASEMAP_ADD:
            return [
                ...state,
                action.payload,
            ];

        case types.BASEMAP_REMOVE:
            return state.filter(basemap => basemap.id !== action.id);

        default:
            return state

    }
};

export default basemaps;
