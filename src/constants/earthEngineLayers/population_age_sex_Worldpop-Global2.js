import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'projects/wpgp-global2/assets/agesex_100m',
        datasetId: 'projects/wpgp-global2/assets/agesex_100m',
        grouping: {
            group: {
                img: 'images/population.png',
                id: 'population',
                type: 'data',
                name: i18n.t('Population'),
                excludeOnSwitch: ['band', 'style'],
            },
        },
        format: 'ImageCollection',
        img: 'images/population.png',
        name: i18n.t('Population age groups WorldPop Global2'),
        description: i18n.t(
            'Estimated number of people living in an area, grouped by age and gender.'
        ),
        descriptionComplement: i18n.t(
            'The data are produced using a top-down population modelling approach, where official population totals are distributed across space and constrained to areas likely to be inhabited. Estimates are provided annually and include current, historical, and projected population values.'
        ),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl: 'https://gee-community-catalog.org/projects/worldpop',
        unit: i18n.t('people per hectare'),
        resolution: {
            spatial: i18n.t('~100 meters'),
            temporal: i18n.t('Yearly'),
            temporalCoverage: i18n.t('2015 - 2030'),
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
                arguments: ['year', '$1:number'],
            },
        ],
        bands: {
            label: i18n.t('Groups'),
            multiple: true,
            list: [
                {
                    id: 'm_00',
                    name: i18n.t('Male 0 - 1 years'),
                },
                {
                    id: 'm_01',
                    name: i18n.t('Male 1 - 4 years'),
                },
                {
                    id: 'm_05',
                    name: i18n.t('Male 5 - 9 years'),
                },
                {
                    id: 'm_10',
                    name: i18n.t('Male 10 - 14 years'),
                },
                {
                    id: 'm_15',
                    name: i18n.t('Male 15 - 19 years'),
                },
                {
                    id: 'm_20',
                    name: i18n.t('Male 20 - 24 years'),
                },
                {
                    id: 'm_25',
                    name: i18n.t('Male 25 - 29 years'),
                },
                {
                    id: 'm_30',
                    name: i18n.t('Male 30 - 34 years'),
                },
                {
                    id: 'm_35',
                    name: i18n.t('Male 35 - 39 years'),
                },
                {
                    id: 'm_40',
                    name: i18n.t('Male 40 - 44 years'),
                },
                {
                    id: 'm_45',
                    name: i18n.t('Male 45 - 49 years'),
                },
                {
                    id: 'm_50',
                    name: i18n.t('Male 50 - 54 years'),
                },
                {
                    id: 'm_55',
                    name: i18n.t('Male 55 - 59 years'),
                },
                {
                    id: 'm_60',
                    name: i18n.t('Male 60 - 64 years'),
                },
                {
                    id: 'm_65',
                    name: i18n.t('Male 65 - 69 years'),
                },
                {
                    id: 'm_70',
                    name: i18n.t('Male 70 - 74 years'),
                },
                {
                    id: 'm_75',
                    name: i18n.t('Male 75 - 79 years'),
                },
                {
                    id: 'm_80',
                    name: i18n.t('Male 80 - 84 years'),
                },
                {
                    id: 'm_85',
                    name: i18n.t('Male 85 - 89 years'),
                },
                {
                    id: 'm_90',
                    name: i18n.t('Male 90 years and above'),
                },
                {
                    id: 'f_00',
                    name: i18n.t('Female 0 - 1 years'),
                },
                {
                    id: 'f_01',
                    name: i18n.t('Female 1 - 4 years'),
                },
                {
                    id: 'f_05',
                    name: i18n.t('Female 5 - 9 years'),
                },
                {
                    id: 'f_10',
                    name: i18n.t('Female 10 - 14 years'),
                },
                {
                    id: 'f_15',
                    name: i18n.t('Female 15 - 19 years'),
                },
                {
                    id: 'f_20',
                    name: i18n.t('Female 20 - 24 years'),
                },
                {
                    id: 'f_25',
                    name: i18n.t('Female 25 - 29 years'),
                },
                {
                    id: 'f_30',
                    name: i18n.t('Female 30 - 34 years'),
                },
                {
                    id: 'f_35',
                    name: i18n.t('Female 35 - 39 years'),
                },
                {
                    id: 'f_40',
                    name: i18n.t('Female 40 - 44 years'),
                },
                {
                    id: 'f_45',
                    name: i18n.t('Female 45 - 49 years'),
                },
                {
                    id: 'f_50',
                    name: i18n.t('Female 50 - 54 years'),
                },
                {
                    id: 'f_55',
                    name: i18n.t('Female 55 - 59 years'),
                },
                {
                    id: 'f_60',
                    name: i18n.t('Female 60 - 64 years'),
                },
                {
                    id: 'f_65',
                    name: i18n.t('Female 65 - 69 years'),
                },
                {
                    id: 'f_70',
                    name: i18n.t('Female 70 - 74 years'),
                },
                {
                    id: 'f_75',
                    name: i18n.t('Female 75 - 79 years'),
                },
                {
                    id: 'f_80',
                    name: i18n.t('Female 80 - 84 years'),
                },
                {
                    id: 'f_85',
                    name: i18n.t('Female 85 - 89 years'),
                },
                {
                    id: 'f_90',
                    name: i18n.t('Female 90 years and above'),
                },
            ],
        },
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
        mosaic: true,
        tileScale: 4,
    }
}
