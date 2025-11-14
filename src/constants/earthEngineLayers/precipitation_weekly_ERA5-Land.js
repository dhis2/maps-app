import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'
import { EE_WEEKLY } from '../periods.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/ERA5_LAND/WEEKLY_AGGR/total_precipitation_sum',
        datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
        group: {
            img: 'images/precipitation.png',
            groupId: 'precipitation',
            groupType: 'data',
            groupName: i18n.t('Precipitation'),
            groupMatchOnSwitch: ['periodType'],
            subGroupId: 'precipitation_era5',
            subGroupType: 'period',
            subGroupName: i18n.t('ERA5'),
            subGroupExcludeOnSwitch: ['period', 'style'],
        },
        format: 'ImageCollection',
        img: 'images/precipitation.png',
        name: i18n.t('Precipitation weekly ERA5'),
        description: i18n.t(
            'Accumulated liquid and frozen water, including rain and snow, that falls to the surface. Combines model data with observations from across the world.'
        ),
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR',
        unit: i18n.t('millimeter'),
        resolution: {
            spatial: i18n.t('~9 kilometers'),
            temporal: i18n.t('Weekly'),
            temporalCoverage: i18n.t('Febuary 1950 - One week ago'),
        },
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        periodType: EE_WEEKLY,
        periodReducer: EE_WEEKLY,
        periodReducerType: 'sum',
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
            max: 400,
            palette: [
                '#f7fbff',
                '#deebf7',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#4292c6',
                '#2171b5',
                '#08519c',
                '#08306b',
            ],
        },
        maskOperator: 'gt',
        opacity: 0.9,
    }
}
