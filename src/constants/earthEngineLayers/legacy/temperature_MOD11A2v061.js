import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'
import { BY_YEAR } from '../../periods.js'

export default {
    legacy: true, // kept for backward compability
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'MODIS/006/MOD11A2',
    datasetId: 'MODIS/006/MOD11A2',
    img: 'images/temperature.png',
    name: i18n.t('Temperature MODIS'),
    unit: i18n.t('°C during daytime'),
    description: i18n.t(
        'Land surface temperatures collected from satellite. Blank spots will appear in areas with a persistent cloud cover.'
    ),
    source: 'NASA LP DAAC / Google Earth Engine',
    sourceUrl:
        'https://explorer.earthengine.google.com/#detail/MODIS%2FMOD11A2',
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    band: 'LST_Day_1km',
    periodType: BY_YEAR,
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    methods: [
        {
            name: 'toFloat',
            arguments: [],
        },
        {
            name: 'multiply',
            arguments: [0.02],
        },
        {
            name: 'subtract',
            arguments: [273.15],
        },
    ],
    style: {
        min: 0,
        max: 40,
        palette: [
            '#fff5f0',
            '#fee0d2',
            '#fcbba1',
            '#fc9272',
            '#fb6a4a',
            '#ef3b2c',
            '#cb181d',
            '#a50f15',
            '#67000d',
        ], // Reds (ColorBrewer)
    },
    maskOperator: 'gte',
    opacity: 0.9,
}
