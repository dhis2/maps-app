import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_MONTHLY } from '../periods.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'UCSB-CHG/CHIRPS/MONTHLY/precipitation',
        datasetId: 'UCSB-CHG/CHIRPS/DAILY',
        group: {
            groupId: 'precipitation',
            groupType: 'period',
            name: i18n.t('Precipitation'),
            img: 'images/precipitation.png',
            excludeOnSwitch: ['period', 'style'],
        },
        format: 'ImageCollection',
        img: 'images/precipitation.png',
        name: i18n.t('Precipitation monthly CHIRPS'),
        description: i18n.t(
            'Climate Hazards Center InfraRed Precipitation with Station data (CHIRPS) incorporates satellite imagery with in-situ station data to create gridded rainfall time series.'
        ),
        source: 'Climate Hazards Center / UCSB',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY',
        unit: i18n.t('millimeter'),
        resolution: {
            spatial: i18n.t('~5.5 kilometers'),
            temporal: i18n.t('Monthly'),
            temporalCoverage: i18n.t('January 1981 - One month ago'),
        },
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        periodType: EE_MONTHLY,
        periodReducer: EE_MONTHLY,
        periodReducerType: 'sum',
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        band: 'precipitation',
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
