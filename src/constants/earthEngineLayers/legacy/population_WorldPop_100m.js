import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'

export default function createConfig() {
    return {
        layer: EARTH_ENGINE_LAYER,
        legacy: true, // Kept for backward compability
        layerId: 'WorldPop/GP/100m/pop',
        datasetId: 'WorldPop/GP/100m/pop',
        format: 'ImageCollection',
        name: i18n.t('Population'),
        unit: i18n.t('people per hectare'),
        description: i18n.t('Estimated number of people living in an area.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
        img: 'images/population.png',
        defaultAggregations: ['sum', 'mean'],
        periodType: 'YEARLY',
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
            max: 10,
            palette: [
                '#fee5d9',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#de2d26',
                '#a50f15',
            ], // Reds (ColorBrewer)
        },
        maskOperator: 'gt',
        opacity: 0.9,
    }
}
