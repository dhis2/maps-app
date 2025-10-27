import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_WEEKLY } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'ECMWF/ERA5_LAND/WEEKLY_AGGR/temperature_2m',
    datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
    group: {
        groupId: 'temperature',
        groupType: 'period',
        name: i18n.t('Temperature'),
        img: 'images/temperature.png',
        excludeOnSwitch: ['period'],
    },
    format: 'ImageCollection',
    img: 'images/temperature.png',
    name: i18n.t('Temperature weekly'),
    description: i18n.t(
        'Temperature at 2m above the surface. Combines model data with observations from across the world.'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR',
    unit: '°C',
    resolution: {
        spatial: i18n.t('~9 kilometers'),
        temporal: i18n.t('Weekly'),
        temporalCoverage: i18n.t('Febuary 1950 - One week ago'),
    },
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    periodType: EE_WEEKLY,
    periodReducer: EE_WEEKLY,
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    bands: {
        label: i18n.t('Temporal aggregatation method'),
        multiple: false,
        default: 'temperature_2m',
        list: [
            { id: 'temperature_2m', name: i18n.t('Mean') },
            { id: 'temperature_2m_min', name: i18n.t('Min') },
            { id: 'temperature_2m_max', name: i18n.t('Max') },
        ],
    },
    band: '',
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
