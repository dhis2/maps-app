import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

// https://earthscience.stackexchange.com/questions/19444/how-to-convert-mol-m2-to-total-mass-e-g-gram-kg-etc
export default {
    layerType: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'ECMWF/CAMS/NRT/NO2',
    datasetId: 'ECMWF/CAMS/NRT',
    name: i18n.t('Nitrogen dioxide CAMS'),
    description: '',
    source: 'ECMWF / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_CAMS_NRT',
    unit: 'mol/m^2',
    periodType: 'range',
    periodReducer: 'mean',
    band: 'total_column_nitrogen_dioxide_surface',
    filters: [
        /*
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
        */
        {
            type: 'date',
            arguments: ['2023-11-01', '2023-11-06'],
        },
    ],
    style: {
        min: 0,
        max: 0.00002,
        palette: [
            '#fff7f3',
            '#fde0dd',
            '#fcc5c0',
            '#fa9fb5',
            '#f768a1',
            '#dd3497',
            '#ae017e',
            '#7a0177',
            '#49006a',
        ],
    },
    opacity: 0.6,
}
