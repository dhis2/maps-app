import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_WEEKLY } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'projects/climate-engine-pro/assets/ce-era5-heat/utci/weekly',
    datasetId: 'projects/climate-engine-pro/assets/ce-era5-heat',
    group: {
        groupId: 'heat',
        groupType: 'period',
        name: i18n.t('Heat stress'),
        img: 'images/heatstress.png',
    },
    format: 'ImageCollection',
    img: 'images/heatstress.png',
    name: i18n.t('Heat stress weekly'),
    description: i18n.t(
        'The Universal Thermal Climate Index (UTCI) is an index that combines the effects of air temperature, humidity, wind speed, and radiation on the human body. It is a measure of the thermal stress experienced by a person in a given environment. Felt temperature in °C.'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl: 'https://gee-community-catalog.org/projects/era5_heat',
    unit: '°C',
    resolution: {
        spatial: i18n.t('~28 kilometers'),
        temporal: i18n.t('Weekly'),
        temporalCoverage: i18n.t('Febuary 1950 - One month ago'),
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
        min: -60,
        max: 60,
        palette: [
            '#0A306B',
            '#0A529C',
            '#2370B5',
            '#4192C5',
            '#9ECBE0',
            '#D8F0A2',
            '#FF8C00',
            '#FF4602',
            '#CE0102',
            '#8B0102',
        ],
        ranges: [
            {
                name: i18n.t('Extreme cold stress -60 - -40'),
                from: -60,
                to: -40,
            },
            {
                name: i18n.t('Very strong cold stress -40 - -27'),
                from: -40,
                to: -27,
            },
            {
                name: i18n.t('Strong cold stress -27 - -13'),
                from: -27,
                to: -13,
            },
            {
                name: i18n.t('Moderate cold stress -13 - 0'),
                from: -13,
                to: 0,
            },
            {
                name: i18n.t('Slight cold stress 0 - 9'),
                from: 0,
                to: 9,
            },
            {
                name: i18n.t('No thermal stress 9 - 26'),
                from: 9,
                to: 26,
            },
            {
                name: i18n.t('Moderate heat stress 26 - 32'),
                from: 26,
                to: 32,
            },
            {
                name: i18n.t('Strong heat stress 32 - 38'),
                from: 32,
                to: 38,
            },
            {
                name: i18n.t('Very strong heat stress 38 - 46'),
                from: 38,
                to: 46,
            },
            {
                name: i18n.t('Extreme heat stress 46 - 60'),
                from: 46,
                to: 60,
            },
        ],
    },
    opacity: 0.9,
}
