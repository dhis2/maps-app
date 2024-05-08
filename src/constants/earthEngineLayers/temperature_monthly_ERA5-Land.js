import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_MONTHLY } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    img: 'images/temperature.png',
    layerId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR/temperature_2m',
    datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
    format: 'ImageCollection',
    name: i18n.t('Temperature monthly'),
    description: i18n.t(
        'Temperature at 2m above the surface. Combines model data with observations from across the world.'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR',
    unit: '°C',
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    periodType: EE_MONTHLY,
    band: 'temperature_2m',
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
            name: 'subtract',
            arguments: [273.15],
        },
    ],
    style: {
        min: 0,
        max: 35,
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
        ],
    },
    opacity: 0.9,
}
