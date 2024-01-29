import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    layerId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers_FeatureView',
    datasetId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers',
    format: 'FeatureView',
    name: i18n.t('Rivers'),
    description: '',
    source: 'WWF / Google Earth Engine',
    style: {
        lineWidth: 2,
        color: {
            property: 'RIV_ORD',
            mode: 'linear',
            palette: ['08519c', '3182bd', '6baed6', 'bdd7e7', 'eff3ff'],
            min: 1,
            max: 10,
        },
    },
    opacity: 0.9,
}
