import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'

export default {
    layer: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'COPERNICUS/S5P/NRTI/L3_O3',
    datasetId: 'COPERNICUS/S5P/NRTI/L3_O3',
    img: 'images/ozone.png',
    name: i18n.t('Ozone'),
    description:
        'Total atmospheric column of O3 between the surface and the top of atmosphere,',
    source: 'European Union / ESA / Copernicus / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_NRTI_L3_O3',
    unit: 'mol/m^2',
    periodType: 'WEEKLY',
    periodReducer: 'mean',
    band: 'O3_column_number_density',
    filters: [
        {
            type: 'date',
            arguments: ['$1', '$2'],
        },
    ],
    style: {
        min: 0.05,
        max: 0.2,
        palette: [
            '#ffffd4',
            '#fee391',
            '#fec44f',
            '#fe9929',
            '#ec7014',
            '#cc4c02',
            '#8c2d04',
        ],
    },
    maskOperator: 'gt',
    precision: 3,
    opacity: 0.7,
}
