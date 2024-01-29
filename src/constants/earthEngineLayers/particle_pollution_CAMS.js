import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

// TODO: Check if we have the best period type and reducer
// https://link.springer.com/article/10.1007/s10661-023-11212-x
export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'ECMWF/CAMS/NRT/PM2.5',
    datasetId: 'ECMWF/CAMS/NRT',
    img: 'images/particle-pollution.png',
    name: i18n.t('Particle pollution'),
    description: 'Particulate matter d < 2.5 um (PM2.5)',
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl: '',
    unit: 'mg/m^3',
    // aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    // defaultAggregations: ['mean', 'min', 'max'],
    periodType: 'DAILY',
    // periodReducer: 'sum',
    band: 'particulate_matter_d_less_than_25_um_surface',
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
        },
    ],
    methods: [
        {
            name: 'multiply',
            arguments: [1000000],
        },
    ],
    style: {
        min: 0.02,
        max: 0.12,
        palette: [
            '#feebe2',
            '#fcc5c0',
            '#fa9fb5',
            '#f768a1',
            '#c51b8a',
            '#7a0177',
        ],
    },
    maskOperator: 'gte',
    precision: 2,
    opacity: 0.9,
}
