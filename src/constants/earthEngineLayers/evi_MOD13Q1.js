import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { BY_YEAR } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'MODIS/061/MOD13Q1/EVI',
    datasetId: 'MODIS/061/MOD13Q1',
    format: 'ImageCollection',
    img: 'images/ndvi.png',
    name: i18n.t('EVI'),
    description: i18n.t(
        'Enhanced Vegetation Index (EVI) is similar to Normalized Difference Vegetation Index (NDVI) and can be used to quantify vegetation greenness. However, EVI corrects for some atmospheric conditions and canopy background noise and is more sensitive in areas with dense vegetation. EVI values range from -1 to 1, with higher values indicating denser vegetation.'
    ),
    source: 'NASA LP DAAC / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD13Q1',
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
    band: 'EVI',
    methods: [
        {
            name: 'multiply',
            arguments: [0.0001],
        },
    ],
    style: {
        min: 0,
        max: 1,
        palette: [
            '#ffffcc',
            '#c2e699',
            '#78c679',
            '#31a354',
            '#006837',
            '#004529',
        ], // YlGn (ColorBrewer)
    },
    popup: '{name}: {value}',
    maskOperator: 'gte',
    opacity: 0.9,
}
