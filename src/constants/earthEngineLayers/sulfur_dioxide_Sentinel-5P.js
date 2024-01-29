import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'COPERNICUS/S5P/NRTI/L3_SO2',
    datasetId: 'COPERNICUS/S5P/NRTI/L3_SO2',
    img: 'images/sulfur-dioxide.png',
    name: i18n.t('Sulfur Dioxide (SO2)'),
    description: 'SO2 vertical column density at ground level.',
    source: 'European Union / ESA / Copernicus / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_NRTI_L3_SO2',
    unit: 'mol/m^2',
    periodType: 'WEEKLY',
    periodReducer: 'mean',
    band: 'SO2_column_number_density',
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
        },
    ],
    style: {
        min: 0.0005,
        max: 0.0025,
        palette: ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'],
    },
    maskOperator: 'gte',
    precision: 4,
    opacity: 0.8,
}
