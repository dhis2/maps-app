import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';

const defaultLayers = () => [
    {
        layer: 'thematic',
        type: i18n.t('Thematic'),
        img: 'images/thematic.png',
        opacity: 0.9,
    },
    {
        layer: 'event',
        type: i18n.t('Events'),
        img: 'images/events.png',
        opacity: 0.8,
        eventClustering: true,
    },
    {
        layer: 'trackedEntity',
        type: i18n.t('Tracked entities'),
        img: 'images/trackedentities.png',
        opacity: 0.5,
    },
    {
        layer: 'facility',
        type: i18n.t('Facilities'),
        img: 'images/facilities.png',
        opacity: 1,
    },
    {
        layer: 'boundary',
        type: i18n.t('Boundaries'),
        img: 'images/boundaries.png',
        opacity: 1,
    },
    {
        layer: 'earthEngine',
        datasetId: 'WorldPop/POP',
        type: i18n.t('Population density'),
        img: 'images/population.png',
        params: {
            min: 0,
            max: 1000,
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'USGS/SRTMGL1_003',
        type: i18n.t('Elevation'),
        img: 'images/elevation.png',
        params: {
            min: 0,
            max: 1500,
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'MODIS/006/MOD11A2',
        type: i18n.t('Temperature'),
        img: 'images/temperature.png',
        params: {
            min: 0,
            max: 50,
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
        type: i18n.t('Precipitation'),
        img: 'images/precipitation.png',
        params: {
            min: 0,
            max: 100,
            palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'MODIS/006/MCD12Q1',
        type: i18n.t('Landcover'),
        img: 'images/landcover.png',
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
        type: i18n.t('Nighttime lights'),
        img: 'images/nighttime.png',
        params: {
            min: 0,
            max: 63,
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#ec7014,#cc4c02,#8c2d04', // YlOrBr
        },
        opacity: 0.9,
    },
];

const layers = (state, action) => {
    const prevState = state || defaultLayers();

    switch (action.type) {
        case types.EXTERNAL_LAYER_ADD:
            return [
                ...prevState,
                {
                    ...action.payload,
                    isVisible: true,
                },
            ];

        case types.EXTERNAL_LAYER_REMOVE:
            return prevState.filter(layer => layer.id !== action.id);

        default:
            return prevState;
    }
};

export default layers;
