import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers.js'

export default {
    layerType: EARTH_ENGINE_LAYER,
    layerId: 'ECMWF/CAMS/NRT/SO2',
    datasetId: 'ECMWF/CAMS/NRT',
    format: 'ImageCollection',
    name: 'Sulfur dioxide',
    description: 'Total column sulfur dioxide surface',
    source: 'Copernicus Climate Data Store / Google Earth Engine',
    unit: 'kg/m^2',
    // aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
    // defaultAggregations: ['mean', 'min', 'max'],
    // periodType: 'daily',
    periodType: 'hourly',
    // periodReducer: 'sum',
    band: 'total_column_sulphur_dioxide_surface',
    filters: [
        {
            type: 'eq',
            arguments: ['system:index', '$1'],
        },
    ],
    methods: [
        {
            name: 'multiply',
            arguments: [1000],
        },
    ],
    style: {
        min: 0,
        max: 0.05,
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
    opacity: 0.9,
}
