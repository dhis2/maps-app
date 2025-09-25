import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_DAILY } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'projects/climate-engine-pro/assets/ce-era5-heat/utci',
    datasetId: 'projects/climate-engine-pro/assets/ce-era5-heat',
    format: 'ImageCollection',
    img: 'images/temperature.png',
    name: i18n.t('Heat stress daily'),
    description: i18n.t(
        'The Universal Thermal Climate Index (UTCI) is an index that combines the effects of air temperature, humidity, wind speed, and radiation on the human body. It is a measure of the thermal stress experienced by a person in a given environment. Felt temperature in °C.'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl: 'https://gee-community-catalog.org/projects/era5_heat',
    unit: '°C',
    resolution: {
        spatial: i18n.t('~28 kilometers'),
        temporal: i18n.t('Daily'),
        temporalCoverage: i18n.t('Febuary 1950 - One month ago'),
    },
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    periodType: EE_DAILY,
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    bands: {
        label: i18n.t('Temporal aggregatation method'),
        multiple: false,
        default: 'utci_mean',
        list: [
            { id: 'utci_mean', name: i18n.t('Mean') },
            { id: 'utci_min', name: i18n.t('Min') },
            { id: 'utci_max', name: i18n.t('Max') },
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
