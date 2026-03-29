import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'projects/sat-io/open-datasets/WORLDPOP/pop',
        datasetId: 'projects/sat-io/open-datasets/WORLDPOP/pop',
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
        name: i18n.t('Population WorldPop Global2'),
        description: i18n.t('Estimated number of people living in an area.'),
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
