import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'USGS/GFSAD1000_V1',
    img: 'images/landcover.png',
    datasetId: 'USGS/GFSAD1000_V1',
    name: i18n.t('Cropland'),
    unit: i18n.t('Cropland'),
    description: 'Cropland data and their water use.',
    source: 'GFSAD / Google Earth Engine',
    band: 'landcover',
    defaultAggregations: 'percentage',
    popup: '{name}: {value}',
    style: [
        {
            value: 1,
            name: 'Irrigation major',
            color: 'orange',
        },
        {
            value: 2,
            name: 'Irrigation minor',
            color: 'brown',
        },
        {
            value: 3,
            name: 'Rainfed',
            color: 'darkseagreen',
        },
        {
            value: 4,
            name: 'Rainfed, minor fragments',
            color: 'green',
        },
        {
            value: 5,
            name: 'Rainfed, very minor fragments',
            color: 'yellow',
        },
    ],
}
