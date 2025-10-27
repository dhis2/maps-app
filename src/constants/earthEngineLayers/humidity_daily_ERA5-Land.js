import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_DAILY } from '../periods.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'ECMWF/ERA5_LAND/DAILY_AGGR/relative_humidity_2m',
    datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
    group: {
        groupId: 'humidity',
        groupType: 'period',
        name: i18n.t('Humidity ERA5'),
        img: 'images/humidity.png',
        excludeOnSwitch: ['period'],
    },
    format: 'ImageCollection',
    img: 'images/humidity.png',
    name: i18n.t('Humidity daily ERA5'),
    description: i18n.t(
        'Relative humidity is the the amount of water vapour present in air expressed as a percentage of the amount needed for saturation at the same temperature (dewpoint).'
    ),
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR',
    unit: '%',
    resolution: {
        spatial: i18n.t('~9 kilometers'),
        temporal: i18n.t('Daily'),
        temporalCoverage: i18n.t('Febuary 1950 - One week ago'),
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
    band: 'relative_humidity_2m',
    bandSource: 'methodsOutput',
    methods: [
        {
            name: 'expression',
            arguments: [
                '100 * exp((17.625 * (Td - 273.15)) / (243.04 + (Td - 273.15))) / exp((17.625 * (T - 273.15)) / (243.04 + (T - 273.15)))',
                { Td: 'dewpoint_temperature_2m', T: 'temperature_2m' },
            ],
        },
        {
            name: 'rename',
            arguments: [['relative_humidity_2m']],
        },
    ],
    style: {
        min: 20,
        max: 90,
        palette: [
            '#fcfbfd',
            '#efedf5',
            '#dadaeb',
            '#bcbddc',
            '#9e9ac8',
            '#807dba',
            '#6a51a3',
            '#54278f',
            '#3f007d',
        ],
    },
    opacity: 0.9,
}
