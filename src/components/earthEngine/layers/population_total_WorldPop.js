import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL',
    img: 'images/population.png',
    datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
    format: 'ImageCollection',
    name: i18n.t('Population'),
    description: i18n.t('Estimated number of people living in an area.'),
    source: 'WorldPop / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
    unit: i18n.t('people per hectare'),
    defaultAggregations: ['sum', 'mean'],
    periodType: 'YEARLY',
    useCentroid: true,
    band: 'population',
    filters: [
        {
            type: 'eq',
            arguments: ['year', '$1'],
        },
    ],
    mosaic: true,
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
}
