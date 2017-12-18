import * as types from '../constants/actionTypes';

const defaultOverlays = [{
    type: 'event',
    title: 'Events Preview',
    img: 'images/layers/events.png',
    opacity: 0.95,
    /*
    program: {
        id: 'eBAyeGv0exc',
        name: 'Inpatient morbidity and mortality'
    },
    programStage: {
        id: 'Zj7UnCAulEk',
        name: 'Single-Event Inpatient morbidity and mortality'
    },
    columns: [{
        dimension: 'qrur9Dvnyt5',
        name: 'Age in years',
        filter: 'LT:50'
    },{
        dimension: "SWfdB5lX0fk",
        name: "Pregnant",
        filter: "IN:1"
    }],
    rows: [{
        dimension: 'ou',
        items: [{
            id: 'ImspTQPwCqd',
            path: "/ImspTQPwCqd"
        }]
    }],
    filters: [{
        dimension: 'pe',
        items: [{
            id: 'LAST_YEAR'
        }]
    }],
    startDate: '2016-08-29',
    endDate: '2017-08-29',
    eventClustering: false,
    eventPointColor: '#333333',
    eventPointRadius: 6,
    */
},{
    type: 'facility',
    title: 'Facilities Preview',
    img: 'images/layers/facilities.png',
    opacity: 1,
    rows: [{
        dimension: 'ou',
        items:[{
          id: 'LEVEL-4'
        }]
    }],
},{
    type: 'thematic',
    title: 'Thematic Preview',
    img: 'images/layers/thematic.png',
    opacity: 0.8,
},{
    type: 'boundary',
    title: 'Boundaries Preview',
    img: 'images/layers/boundaries.png',
    opacity: 1,
},{
    type: 'earthEngine',
    datasetId: 'WorldPop/POP',
    title: 'Population density',
    img: 'images/layers/population.png',
    params: {
        min: 0,
        max: 1000,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
    },
    opacity: 0.9,
},{
    type: 'earthEngine',
    datasetId: 'USGS/SRTMGL1_003',
    title: 'Elevation',
    img: 'images/layers/elevation.png',
    params: {
        min: 0,
        max: 1500,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
    },
    opacity: 0.9,
},{
    type: 'earthEngine',
    datasetId: 'MODIS/MOD11A2',
    title: 'Temperature',
    img: 'images/layers/temperature.png',
    params: {
        min: 0,
        max: 50,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
    },
    opacity: 0.9,
},{
    type: 'earthEngine',
    datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
    title: 'Precipitation',
    img: 'images/layers/precipitation.png',
    params: {
        min: 0,
        max: 100,
        palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
    },
    opacity: 0.9,
},{
    type: 'earthEngine',
    datasetId: 'MODIS/051/MCD12Q1',
    title: 'Landcover',
    img: 'images/layers/landcover.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    datasetId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
    title: 'Nighttime lights',
    img: 'images/layers/nighttime.png',
    params: {
        min: 0,
        max: 63,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#ec7014,#cc4c02,#8c2d04', // YlOrBr
    },
    opacity: 0.9,
}/*,{
    type: 'event',
    old: true,
    title: 'Events',
    img: 'images/layers/events.png',
    opacity: 0.95,
},{
    type: 'facility',
    old: true,
    title: 'Facilities',
    img: 'images/layers/facilities.png',
    opacity: 1,
},{
    type: 'thematic',
    old: true,
    title: 'Thematic',
    img: 'images/layers/thematic.png',
    opacity: 0.8,
},{
    type: 'boundary',
    old: true,
    title: 'Boundaries',
    img: 'images/layers/boundaries.png',
    opacity: 1,
},{
    type: 'earthEngine',
    old: true,
    title: 'Population density',
    img: 'images/layers/population.png',
    subtitle: '2010',
    opacity: 0.9,
},{
    type: 'earthEngine',
    old: true,
    title: 'Elevation',
    img: 'images/layers/elevation.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    old: true,
    title: 'Temperature',
    img: 'images/layers/temperature.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    old: true,
    title: 'Landcover',
    img: 'images/layers/landcover.png',
    opacity: 0.9,
},{
    type: 'earthEngine',
    old: true,
    title: 'Precipitation',
    img: 'images/layers/precipitation.png',
    subtitle: '26 - 28 Nov. 2016',
    opacity: 0.9,
},{
    type: 'earthEngine',
    old: true,
    title: 'Nighttime lights',
    img: 'images/layers/nighttime.png',
    opacity: 0.9,
}*/];

const overlays = (state = defaultOverlays, action) => {

    switch (action.type) {

        case types.EXTERNAL_OVERLAY_ADD:
            return [
                ...state,
                action.payload,
            ];

        case types.EXTERNAL_OVERLAY_REMOVE:
            return state.filter(overlay => overlay.id !== action.id);

        default:
            return state

    }
};

export default overlays;
