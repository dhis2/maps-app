import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'

export const legacyBuildingsDatasetId =
    'GOOGLE/Research/open-buildings/v1/polygons'

export default {
    legacy: true, // Kept for backward compability
    layer: EARTH_ENGINE_LAYER,
    layerId: legacyBuildingsDatasetId,
    datasetId: legacyBuildingsDatasetId,
    format: 'FeatureCollection',
    name: i18n.t('Building footprints'),
    unit: i18n.t('Number of buildings'),
    description: i18n.t(
        'The outlines of buildings derived from high-resolution satellite imagery. Only for the continent of Africa.'
    ),
    notice: i18n.t(
        'Building counts are only available for smaller organisation unit areas.'
    ),
    error: i18n.t(
        'Select a smaller area or single organization unit to see the count of buildings.'
    ),
    source: 'Google Research',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_Research_open-buildings_v1_polygons',
    img: 'images/buildings.png',
    aggregations: ['count'],
    defaultAggregations: ['count'],
    style: {
        color: '#FFA500',
        strokeWidth: 1,
    },
    opacity: 0.9,
}
