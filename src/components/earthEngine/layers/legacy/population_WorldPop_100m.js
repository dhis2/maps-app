import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    legacy: true, // Kept for backward compability
    layerId: 'WorldPop/GP/100m/pop',
    datasetId: 'WorldPop/GP/100m/pop',
    name: i18n.t('Population'),
    unit: i18n.t('people per hectare'),
    description: i18n.t('Estimated number of people living in an area.'),
    source: 'WorldPop / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
    img: 'images/population.png',
    defaultAggregations: ['sum', 'mean'],
    periodType: 'Yearly',
    filters: ({ id, name, year }) => [
        {
            id,
            name,
            type: 'eq',
            arguments: ['year', year],
        },
    ],
    mosaic: true,
    params: {
        min: 0,
        max: 10,
        palette: [
            '#fee5d9',
            '#fcbba1',
            '#fc9272',
            '#fb6a4a',
            '#de2d26',
            '#a50f15',
        ], // Reds
    },
    opacity: 0.9,
}
