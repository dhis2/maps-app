import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'FeatureCollection',
    layerId: 'RESOLVE/ECOREGIONS/2017',
    datasetId: 'RESOLVE/ECOREGIONS/2017',
    name: i18n.t('Ecoregions'),
    description: '',
    source: 'RESOLVE / Google Earth Engine',
    style: {
        byProperty: 'COLOR',
    },
    opacity: 0.9,
}
