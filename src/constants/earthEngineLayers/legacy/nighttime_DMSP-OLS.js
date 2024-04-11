import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'

export const legacyNighttimeDatasetId = 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS'

export default {
    legacy: true, // Kept for backward compability
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: legacyNighttimeDatasetId,
    datasetId: legacyNighttimeDatasetId,
    name: i18n.t('Nighttime lights'),
    unit: i18n.t('light intensity'),
    description: i18n.t(
        'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.'
    ),
    source: 'NOAA / Google Earth Engine',
    sourceUrl:
        'https://explorer.earthengine.google.com/#detail/NOAA%2FDMSP-OLS%2FNIGHTTIME_LIGHTS',
    periodType: 'YEARLY',
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    band: 'stable_lights',
    img: 'images/nighttime.png',
    style: {
        min: 0,
        max: 63,
        palette: [
            '#ffffd4',
            '#fee391',
            '#fec44f',
            '#fe9929',
            '#ec7014',
            '#cc4c02',
            '#8c2d04',
        ], // YlOrBr (ColorBrewer)
    },
    maskOperator: 'gte',
    opacity: 0.9,
}
