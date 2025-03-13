import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { BY_YEAR } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'MODIS/061/MOD13Q1/NDVI',
    datasetId: 'MODIS/061/MOD13Q1',
    format: 'ImageCollection',
    img: 'images/ndvi.png',
    name: i18n.t('Vegetation index (NDVI)'),
    description: i18n.t(
        'Normalized difference vegetation index (NDVI) is used to quantify vegetation greenness and is useful in understanding vegetation density and assessing changes in plant health.'
    ),
    source: 'NASA LP DAAC / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD13Q1',
    unit: i18n.t('NDVI'),
    resolution: {
        spatial: i18n.t('250 meter'),
        temporal: i18n.t('16-day'),
        temporalCoverage: i18n.t('Febuary 2000 - One month ago'),
    },
    aggregations: ['min', 'max', 'mean', 'median', 'sum', 'stdDev', 'variance'],
    defaultAggregations: ['mean'],
    periodType: BY_YEAR,
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    band: 'NDVI',
    style: {
        min: 0,
        max: 8000,
        palette: [
            '#ffffe5',
            '#f7fcb9',
            '#d9f0a3',
            '#addd8e',
            '#78c679',
            '#41ab5d',
            '#238443',
            '#006837',
            '#004529',
        ], // YlGn (ColorBrewer)
    },
    popup: '{name}: {value}',
    maskOperator: 'gte',
    opacity: 0.9,
}
