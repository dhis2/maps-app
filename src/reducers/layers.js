import * as types from '../constants/actionTypes';

const defaultLayers = [{
    layer: 'event',
    title: 'Events Preview',
    img: 'images/events.png',
    opacity: 0.95,
},{
    layer: 'facility',
    title: 'Facilities Preview',
    img: 'images/facilities.png',
    opacity: 1,
    rows: [{
        dimension: 'ou',
        items:[{
          id: 'LEVEL-4'
        }]
    }],
},{
    layer: 'thematic',
    title: 'Thematic Preview',
    img: 'images/thematic.png',
    opacity: 0.8,
},{
    layer: 'boundary',
    title: 'Boundaries Preview',
    img: 'images/boundaries.png',
    opacity: 1,
},{
    layer: 'earthEngine',
    datasetId: 'WorldPop/POP',
    title: 'Population density',
    img: 'images/population.png',
    params: {
        min: 0,
        max: 1000,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
    },
    opacity: 0.9,
},{
    layer: 'earthEngine',
    datasetId: 'USGS/SRTMGL1_003',
    title: 'Elevation',
    img: 'images/elevation.png',
    params: {
        min: 0,
        max: 1500,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
    },
    opacity: 0.9,
},{
    layer: 'earthEngine',
    datasetId: 'MODIS/MOD11A2',
    title: 'Temperature',
    img: 'images/temperature.png',
    params: {
        min: 0,
        max: 50,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
    },
    opacity: 0.9,
},{
    layer: 'earthEngine',
    datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
    title: 'Precipitation',
    img: 'images/precipitation.png',
    params: {
        min: 0,
        max: 100,
        palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
    },
    opacity: 0.9,
},{
    layer: 'earthEngine',
    datasetId: 'MODIS/051/MCD12Q1',
    title: 'Landcover',
    img: 'images/landcover.png',
    opacity: 0.9,
},{
    layer: 'earthEngine',
    datasetId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
    title: 'Nighttime lights',
    img: 'images/nighttime.png',
    params: {
        min: 0,
        max: 63,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#ec7014,#cc4c02,#8c2d04', // YlOrBr
    },
    opacity: 0.9,
}];

const layers = (state = defaultLayers, action) => {

    switch (action.type) {

        case types.EXTERNAL_LAYER_ADD:
            return [
                ...state,
                action.payload,
            ];

        case types.EXTERNAL_LAYER_REMOVE:
            return state.filter(layer => layer.id !== action.id);

        default:
            return state

    }
};

export default layers;
