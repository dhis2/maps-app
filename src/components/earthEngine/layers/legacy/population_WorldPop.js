import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    legacy: true, // Kept for backward compability
    layerId: 'WorldPop/POP',
    datasetId: 'WorldPop/POP',
    name: i18n.t('Population'),
    unit: i18n.t('people per km²'),
    description: i18n.t('Estimated number of people living in an area.'),
    source: 'WorldPop / Google Earth Engine',
    sourceUrl: 'https://explorer.earthengine.google.com/#detail/WorldPop%2FPOP',
    img: 'images/population.png',
    periodType: 'YEARLY',
    filters: ({ id, name, year }) => [
        {
            id,
            name,
            type: 'eq',
            arguments: ['year', year],
        },
        {
            type: 'eq',
            arguments: ['UNadj', 'yes'],
        },
    ],
    mosaic: true,
    params: {
        min: 0,
        max: 1000,
        palette: [
            '#fee5d9',
            '#fcbba1',
            '#fc9272',
            '#fb6a4a',
            '#de2d26',
            '#a50f15',
        ], // Reds
    },
    methods: {
        multiply: [100], // Convert from people/hectare to people/km2
    },
    opacity: 0.9,
}
