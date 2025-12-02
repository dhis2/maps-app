import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_MONTHLY } from '../periods.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR/total_precipitation_sum',
        datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
        grouping: {
            group: {
                img: 'images/precipitation.png',
                id: 'precipitation',
                type: 'data',
                name: i18n.t('Precipitation'),
                excludeOnSwitch: ['band'],
                matchOnSwitch: ['periodType'],
            },
            subGroup: {
                id: 'precipitation_era5',
                type: 'period',
                name: i18n.t('ERA5'),
                excludeOnSwitch: ['period', 'style'],
            },
        },
        format: 'ImageCollection',
        img: 'images/precipitation.png',
        name: i18n.t('Precipitation monthly ERA5'),
        description: i18n.t('Gridded precipitation dataset.'),
        descriptionComplement: i18n.t(
            'Combines model data with observations from around the world and provides estimates of both rain and snow over land at high temporal resolution, typically available within about one week.'
        ),
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR',
        unit: i18n.t('millimeter'),
        resolution: {
            spatial: i18n.t('~9 kilometers'),
            temporal: i18n.t('Monthly'),
            temporalCoverage: i18n.t('Febuary 1950 - One month ago'),
        },
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        periodType: EE_MONTHLY,
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        band: 'total_precipitation_sum',
        methods: [
            {
                name: 'multiply',
                arguments: [1000],
            },
        ],
        style: {
            min: 0,
            max: 700,
            palette: [
                '#f7fbff',
                '#deebf7',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#4292c6',
                '#2171b5',
                '#084594',
            ],
        },
        maskOperator: 'gt',
        opacity: 0.9,
    }
}
