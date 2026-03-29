import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_DAILY } from '../periods.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/ERA5_LAND/DAILY_AGGR/relative_humidity_2m',
        datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
        grouping: {
            group: {
                img: 'images/humidity.png',
                id: 'humidity',
                type: 'period',
                name: i18n.t('Relative humidity'),
                excludeOnSwitch: ['period'],
            },
        },
        format: 'ImageCollection',
        img: 'images/humidity.png',
        name: i18n.t('Relative humidity daily'),
        description: i18n.t('Amount of water vapour present in air.'),
        descriptionComplement: i18n.t(
            'Relative humidity is expressed as a percentage of the maximum amount of water vapor the air can hold at the same temperature.'
        ),
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR',
        unit: '%',
        resolution: {
            spatial: i18n.t('~9 kilometers'),
            temporal: i18n.t('Daily'),
            temporalCoverage: i18n.t('Since February 1950'),
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
            min: 15,
            max: 90,
            palette: [
                '#f2f0f7',
                '#dadaeb',
                '#bcbddc',
                '#9e9ac8',
                '#807dba',
                '#6a51a3',
                '#4a1486',
            ],
        },
        opacity: 0.9,
    }
}
