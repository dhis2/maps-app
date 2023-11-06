import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    format: 'ImageCollection',
    layerId: 'COPERNICUS/S5P/NRTI/L3_NO2',
    datasetId: 'COPERNICUS/S5P/NRTI/L3_NO2',
    name: i18n.t('Nitrogen dioxide (NO2)'),
    description:
        'Total vertical column of Nitrogen dioxide (NO2). This gas enters the atmosphere as a result of human activities (notably fossil fuel combustion and biomass burning) and natural processes (wildfires, lightning, and microbiological processes in soils).',
    source: 'European Union / ESA / Copernicus / Google Earth Engine',
    sourceUrl:
        'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_NRTI_L3_NO2',
    unit: 'mol/m^2',
    periodType: 'range',
    periodReducer: 'mean',
    band: 'NO2_column_number_density',
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
        max: 0.0002,
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
