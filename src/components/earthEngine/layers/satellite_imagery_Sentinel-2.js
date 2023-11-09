import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

// https://medium.com/google-earth/all-clear-with-cloud-score-bd6ee2e2235e
export default {
    layerType: EARTH_ENGINE_LAYER, // TODO: Remove?
    format: 'ImageCollection',
    layerId: 'COPERNICUS/S2_SR_HARMONIZED',
    datasetId: 'COPERNICUS/S2_SR_HARMONIZED',
    img: 'images/satellite-imagery.png',
    name: i18n.t('Satellite imagery (Sentinel-2)'),
    description: '',
    source: 'Copernicus / Google Earth Engine',
    periodType: 'WEEKLY',
    periodRange: {
        firstDate: '2021-01-01',
        lastDate: -1, // today minus one day
    },
    periodReducer: 'median',
    cloudScore: {
        datasetId: 'GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED',
        band: 'cs',
        clearTreshold: 0.6,
    },
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
            // arguments: ['2022-08-27', '2022-09-05'], // Pakistan floods
        },
    ],
    style: {
        bands: ['B4', 'B3', 'B2'], // red, green, blue
        min: 0,
        max: 2500,
    },
    opacity: 0.9,
}
