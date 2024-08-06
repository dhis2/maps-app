import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'GOOGLE/Research/open-buildings/v3/polygons',
    datasetId: 'GOOGLE/Research/open-buildings/v3/polygons',
    format: 'FeatureCollection',
    img: 'images/buildings.png',
    name: i18n.t('Building footprints'),
    description: i18n.t(
        'The outlines of buildings derived from high-resolution satellite imagery. Only for Sub-Saharan Africa, South and South-East Asia, Latin America and the Caribbean.'
    ),
    notice: i18n.t(
        'Building counts are only available for smaller organisation unit areas.'
    ),
    error: i18n.t(
        'Select a smaller area or single organization unit to see the count of buildings.'
    ),
    source: 'Google Research',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_Research_open-buildings_v3_polygons',
    unit: i18n.t('Number of buildings'),
    resolution: {
        spatial: i18n.t('0.5 meter'),
        temporal: i18n.t('Single point in time'),
        temporalCoverage: i18n.t('May 2023'),
    },
    aggregations: ['count'],
    defaultAggregations: ['count'],
    style: {
        color: '#FFA500',
        strokeWidth: 1,
    },
    opacity: 0.9,
}
