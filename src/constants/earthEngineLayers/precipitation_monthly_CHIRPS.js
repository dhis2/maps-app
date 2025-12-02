import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_MONTHLY } from '../periods.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'UCSB-CHG/CHIRPS/MONTHLY/precipitation',
        datasetId: 'UCSB-CHG/CHIRPS/DAILY',
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
                id: 'precipitation_chirps',
                type: 'period',
                name: i18n.t('CHIRPS'),
                excludeOnSwitch: ['period', 'style'],
            },
        },
        format: 'ImageCollection',
        img: 'images/precipitation.png',
        name: i18n.t('Precipitation monthly CHIRPS'),
        description: i18n.t('Gridded precipitation dataset.'),
        descriptionComplement: i18n.t(
            'Combines satellite imagery with in-situ station data and provides rainfall-focused estimates over land at higher spatial resolution but with a longer lag in data availability.'
        ),
        source: 'Climate Hazards Center / UCSB',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY',
        unit: i18n.t('millimeter'),
        resolution: {
            spatial: i18n.t('~5.5 kilometers'),
            temporal: i18n.t('Monthly (aggregated from Daily data)'),
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
