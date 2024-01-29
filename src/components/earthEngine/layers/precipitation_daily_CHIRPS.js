import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    img: 'images/precipitation.png',
    layerId: 'UCSB-CHG/CHIRPS/DAILY',
    datasetId: 'UCSB-CHG/CHIRPS/DAILY',
    format: 'ImageCollection',
    name: i18n.t('Precipitation CHIRPS'),
    description: i18n.t(
        'Precipitation collected from satellite and weather stations on the ground.'
    ),
    source: 'CHIRPS / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY',
    unit: i18n.t('millimeter'),
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    periodType: 'DAILY',
    periodReducer: 'sum',
    band: 'precipitation',
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
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
    maskOperator: 'gt',
    opacity: 0.9,
}
