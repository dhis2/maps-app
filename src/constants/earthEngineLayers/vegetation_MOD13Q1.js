import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { BY_YEAR } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'MODIS/061/MOD13Q1/VI',
    datasetId: 'MODIS/061/MOD13Q1',
    format: 'ImageCollection',
    img: 'images/vegetation.png',
    name: i18n.t('Vegetation index'),
    description: i18n.t(
        'NDVI and EVI values range from -1 to 1, with higher values indicating denser vegetation.'
    ),
    descriptionComplement: i18n.t(
        'Normalized difference vegetation index (NDVI) is used to quantify vegetation greenness and is useful in understanding vegetation density and assessing changes in plant health. \n Enhanced Vegetation Index (EVI) is similar to NDVI. However, EVI corrects for some atmospheric conditions and canopy background noise and is more sensitive in areas with dense vegetation.'
    ),
    source: 'NASA LP DAAC / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD13Q1',
    unit: i18n.t('unitless'),
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
    bands: {
        label: i18n.t('Index'),
        multiple: false,
        default: 'NDVI',
        list: [
            { id: 'NDVI', name: i18n.t('NDVI') },
            { id: 'EVI', name: i18n.t('EVI') },
        ],
    },
    methods: [
        {
            name: 'multiply',
            arguments: [0.0001],
        },
    ],
    style: {
        min: 0,
        max: 0.8,
        palette: [
            '#f1eda9',
            '#ffffbf',
            '#d9ef8b',
            '#a6d96a',
            '#66bd63',
            '#1a9850',
            '#238443',
            '#006837',
            '#004529',
        ], // Vegetation (custom scale)
    },
    popup: '{name}: {value}',
    maskOperator: 'gte',
    opacity: 0.9,
}
