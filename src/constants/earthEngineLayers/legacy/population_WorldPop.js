import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    legacy: true, // Kept for backward compability
    layerId: 'WorldPop/POP',
    datasetId: 'WorldPop/POP',
    format: 'ImageCollection',
    name: i18n.t('Population'),
    unit: i18n.t('people per km²'),
    description: i18n.t('Estimated number of people living in an area.'),
    source: 'WorldPop / Google Earth Engine',
    sourceUrl: 'https://explorer.earthengine.google.com/#detail/WorldPop%2FPOP',
    img: 'images/population.png',
    periodType: 'YEARLY',
    band: 'population',
    filters: [
        {
            type: 'eq',
            arguments: ['year', '$1'],
        },
        {
            type: 'eq',
            arguments: ['UNadj', 'yes'],
        },
    ],
    mosaic: true,
    style: {
        min: 0,
        max: 1000,
        palette: [
            '#fee5d9',
            '#fcbba1',
            '#fc9272',
            '#fb6a4a',
            '#de2d26',
            '#a50f15',
        ], // Reds (ColorBrewer)
    },
    methods: {
        multiply: [100], // Convert from people/hectare to people/km2
    },
    maskOperator: 'gt',
    opacity: 0.9,
}
