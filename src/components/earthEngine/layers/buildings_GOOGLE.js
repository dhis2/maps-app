import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'FeatureCollection',
    layerId: 'GOOGLE/Research/open-buildings/v1/polygons',
    img: 'images/buildings.png',
    datasetId: 'GOOGLE/Research/open-buildings/v1/polygons',
    name: i18n.t('Building footprints'),
    description: i18n.t(
        'The outlines of buildings derived from high-resolution satellite imagery. Only for the continent of Africa.'
    ),
    notice: i18n.t(
        'Building counts are only available for smaller organisation unit areas.'
    ),
    error: i18n.t(
        'Select a smaller area or single organization unit to see the count of buildings.'
    ),
    source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
    sourceUrl: 'https://sites.research.google/open-buildings/',
    unit: i18n.t('Number of buildings'),
    aggregations: ['count'],
    defaultAggregations: ['count'],
    /* Not supported in UI yet
    customFilters: [
        {
            type: 'gt',
            arguments: ['area_in_meters', $1],
            valueType: 'number',
            label: 'Area in m²',
        },
    ],
    */
    style: {
        color: '#FFA500',
        strokeWidth: 1,
    },
    opacity: 0.9,
}
