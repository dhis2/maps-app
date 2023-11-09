import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    img: 'images/precipitation.png',
    layerId: 'ECMWF/ERA5_LAND/DAILY_AGGR/total_precipitation_sum',
    datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
    format: 'ImageCollection',
    name: i18n.t('Precipitation daily'),
    description: i18n.t(
        'Accumulated liquid and frozen water, including rain and snow, that falls to the surface. Combines model data with observations from across the world.'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR',
    unit: i18n.t('millimeter'),
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    periodType: 'DAILY',
    periodReducer: 'sum',
    band: 'total_precipitation_sum',
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
        },
    ],
    methods: [
        {
            name: 'multiply',
            arguments: [1000],
        },
    ],
    style: {
        min: 0,
        max: 10,
        palette: [
            '#eff3ff',
            '#c6dbef',
            '#9ecae1',
            '#6baed6',
            '#3182bd',
            '#08519c',
        ],
    },
    opacity: 0.9,
}
