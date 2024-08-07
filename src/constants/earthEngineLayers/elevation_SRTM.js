import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'USGS/SRTMGL1_003',
    datasetId: 'USGS/SRTMGL1_003',
    format: 'Image',
    img: 'images/elevation.png',
    name: i18n.t('Elevation'),
    description: i18n.t('Elevation above sea-level.'),
    source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/USGS_SRTMGL1_003',
    unit: i18n.t('meters'),
    resolution: {
        spatial: i18n.t('~30 meters'),
        temporal: i18n.t('Single point in time'),
        temporalCoverage: i18n.t('Febuary 2000'),
    },
    aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    defaultAggregations: ['mean', 'min', 'max'],
    band: 'elevation',
    style: {
        min: 0,
        max: 1500,
        palette: [
            '#ffffd4',
            '#fee391',
            '#fec44f',
            '#fe9929',
            '#d95f0e',
            '#993404',
        ], // YlOrBr (ColorBrewer)
    },
    maskOperator: 'gte',
    opacity: 0.9,
}
