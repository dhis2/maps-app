import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL',
        datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
        groupping: {
            img: 'images/population.png',
            groupId: 'population',
            groupType: 'data',
            groupName: i18n.t('Population'),
            groupExcludeOnSwitch: ['band', 'style'],
        },
        format: 'ImageCollection',
        img: 'images/population.png',
        name: i18n.t('Population'),
        description: i18n.t('Estimated number of people living in an area.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
        unit: i18n.t('people per hectare'),
        resolution: {
            spatial: i18n.t('~100 meters'),
            temporal: i18n.t('Single point in time'),
            temporalCoverage: i18n.t('2020'),
        },
        aggregations: [
            'min',
            'max',
            'mean',
            'median',
            'sum',
            'stdDev',
            'variance',
        ],
        defaultAggregations: ['sum', 'mean'],
        unmaskAggregation: true,
        periodType: 'YEARLY',
        filters: [
            {
                type: 'eq',
                arguments: ['year', '$1'],
            },
        ],
        band: 'population',
        style: {
            min: 0,
            max: 25,
            palette: [
                '#fee5d9',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#de2d26',
                '#a50f15',
            ],
        },
        maskOperator: 'gt',
        opacity: 0.9,
        mosaic: true,
    }
}
