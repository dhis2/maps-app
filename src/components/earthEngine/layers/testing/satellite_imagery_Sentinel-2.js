import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER, // TODO: Remove?
    layerId: 'COPERNICUS/S2_SR_HARMONIZED',
    datasetId: 'COPERNICUS/S2_SR_HARMONIZED',
    format: 'ImageCollection',
    name: 'Satellite imagery (Sentinel-2)',
    description: '',
    source: 'Copernicus / Google Earth Engine',
    periodType: 'range',
    periodReducer: 'median',
    cloudScore: {
        datasetId: 'GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED',
        band: 'cs',
        clearTreshold: 0.6,
    },
    filters: [
        {
            type: 'date',
            // arguments: ['$1', '$2'],
            // arguments: ['2023-01-01', '2023-02-01'],
            // arguments: ['2023-06-01', '2023-07-01'],
            arguments: ['2022-08-27', '2022-09-05'], // Pakistan floods
            // arguments: ['2023-08-21', '2023-09-05'],
        },
    ],
    style: {
        bands: ['B4', 'B3', 'B2'], // red, green, blue
        min: 0,
        max: 2500,
    },
    opacity: 0.9,
}
