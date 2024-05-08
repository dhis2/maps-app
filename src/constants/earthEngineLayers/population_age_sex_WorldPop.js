import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
    datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
    img: 'images/population.png',
    name: i18n.t('Population age groups'),
    unit: 'people per hectare',
    description: i18n.t(
        'Estimated number of people living in an area, grouped by age and gender.'
    ),
    source: 'WorldPop / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
    periodType: 'YEARLY',
    defaultAggregations: ['sum', 'mean'],
    useCentroid: true,
    bands: [
        {
            id: 'M_0',
            name: i18n.t('Male 0 - 1 years'),
        },
        {
            id: 'M_1',
            name: i18n.t('Male 1 - 4 years'),
        },
        {
            id: 'M_5',
            name: i18n.t('Male 5 - 9 years'),
        },
        {
            id: 'M_10',
            name: i18n.t('Male 10 - 14 years'),
        },
        {
            id: 'M_15',
            name: i18n.t('Male 15 - 19 years'),
        },
        {
            id: 'M_20',
            name: i18n.t('Male 20 - 24 years'),
        },
        {
            id: 'M_25',
            name: i18n.t('Male 25 - 29 years'),
        },
        {
            id: 'M_30',
            name: i18n.t('Male 30 - 34 years'),
        },
        {
            id: 'M_35',
            name: i18n.t('Male 35 - 39 years'),
        },
        {
            id: 'M_40',
            name: i18n.t('Male 40 - 44 years'),
        },
        {
            id: 'M_45',
            name: i18n.t('Male 45 - 49 years'),
        },
        {
            id: 'M_50',
            name: i18n.t('Male 50 - 54 years'),
        },
        {
            id: 'M_55',
            name: i18n.t('Male 55 - 59 years'),
        },
        {
            id: 'M_60',
            name: i18n.t('Male 60 - 64 years'),
        },
        {
            id: 'M_65',
            name: i18n.t('Male 65 - 69 years'),
        },
        {
            id: 'M_70',
            name: i18n.t('Male 70 - 74 years'),
        },
        {
            id: 'M_75',
            name: i18n.t('Male 75 - 79 years'),
        },
        {
            id: 'M_80',
            name: i18n.t('Male 80 years and above'),
        },
        {
            id: 'F_0',
            name: i18n.t('Female 0 - 1 years'),
        },
        {
            id: 'F_1',
            name: i18n.t('Female 1 - 4 years'),
        },
        {
            id: 'F_5',
            name: i18n.t('Female 5 - 9 years'),
        },
        {
            id: 'F_10',
            name: i18n.t('Female 10 - 14 years'),
        },
        {
            id: 'F_15',
            name: i18n.t('Female 15 - 19 years'),
        },
        {
            id: 'F_20',
            name: i18n.t('Female 20 - 24 years'),
        },
        {
            id: 'F_25',
            name: i18n.t('Female 25 - 29 years'),
        },
        {
            id: 'F_30',
            name: i18n.t('Female 30 - 34 years'),
        },
        {
            id: 'F_35',
            name: i18n.t('Female 35 - 39 years'),
        },
        {
            id: 'F_40',
            name: i18n.t('Female 40 - 44 years'),
        },
        {
            id: 'F_45',
            name: i18n.t('Female 45 - 49 years'),
        },
        {
            id: 'F_50',
            name: i18n.t('Female 50 - 54 years'),
        },
        {
            id: 'F_55',
            name: i18n.t('Female 55 - 59 years'),
        },
        {
            id: 'F_60',
            name: i18n.t('Female 60 - 64 years'),
        },
        {
            id: 'F_65',
            name: i18n.t('Female 65 - 69 years'),
        },
        {
            id: 'F_70',
            name: i18n.t('Female 70 - 74 years'),
        },
        {
            id: 'F_75',
            name: i18n.t('Female 75 - 79 years'),
        },
        {
            id: 'F_80',
            name: i18n.t('Female 80 years and above'),
        },
    ],
    filters: [
        {
            type: 'eq',
            arguments: ['year', '$1'],
        },
    ],
    mosaic: true,
    style: {
        min: 0,
        max: 10,
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
    tileScale: 4,
}
