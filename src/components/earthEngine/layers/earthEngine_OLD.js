import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from './layers.js'

export const earthEngineLayers = [
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/CAMS/NRT/NO2',
        datasetId: 'ECMWF/CAMS/NRT',
        format: 'ImageCollection',
        name: 'Nitrogen dioxide',
        description: 'Total column of nitrogen dioxide surface',
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        unit: 'kg/m^2',
        // aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        // defaultAggregations: ['mean', 'min', 'max'],
        // periodType: 'daily',
        periodType: 'hourly',
        // periodReducer: 'sum',
        band: 'total_column_nitrogen_dioxide_surface',
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
    },
    {
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
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/CAMS/NRT/CO',
        datasetId: 'ECMWF/CAMS/NRT',
        format: 'ImageCollection',
        name: 'Carbon monoxide',
        description: 'Total column carbon monoxide surface',
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        unit: 'kg/m^2',
        // aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        // defaultAggregations: ['mean', 'min', 'max'],
        // periodType: 'daily',
        periodType: 'hourly',
        // periodReducer: 'sum',
        band: 'total_column_carbon_monoxide_surface',
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
            max: 3,
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
    },
    {
        layerType: EARTH_ENGINE_LAYER, // TODO: Remove?
        layerId: 'COPERNICUS/S2_SR_HARMONIZED',
        datasetId: 'COPERNICUS/S2_SR_HARMONIZED',
        format: 'ImageCollection',
        name: 'Sentinel-2 imagery',
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
    },
]

/*
// layerId should be unique
// datasetId is the Earth Engine dataset id
export const earthEngineLayers = () => [
    {
        layer: EARTH_ENGINE_LAYER,
        legacy: true, // Kept for backward compability
        layerId: 'WorldPop/GP/100m/pop',
        datasetId: 'WorldPop/GP/100m/pop',
        name: i18n.t('Population'),
        unit: i18n.t('people per hectare'),
        description: i18n.t('Estimated number of people living in an area.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
        img: 'images/population.png',
        defaultAggregations: ['sum', 'mean'],
        periodType: 'Yearly',
        filters: ({ id, name, year }) => [
            {
                id,
                name,
                type: 'eq',
                arguments: ['year', year],
            },
        ],
        mosaic: true,
        params: {
            min: 0,
            max: 10,
            palette: [
                '#fee5d9',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#de2d26',
                '#a50f15',
            ], // Reds
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        legacy: true, // Kept for backward compability
        layerId: 'WorldPop/POP',
        datasetId: 'WorldPop/POP',
        name: i18n.t('Population'),
        unit: i18n.t('people per km²'),
        description: i18n.t('Estimated number of people living in an area.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/WorldPop%2FPOP',
        img: 'images/population.png',
        periodType: 'Yearly',
        filters: ({ id, name, year }) => [
            {
                id,
                name,
                type: 'eq',
                arguments: ['year', year],
            },
            {
                type: 'eq',
                arguments: ['UNadj', 'yes'],
            },
        ],
        mosaic: true,
        params: {
            min: 0,
            max: 1000,
            palette: [
                '#fee5d9',
                '#fcbba1',
                '#fc9272',
                '#fb6a4a',
                '#de2d26',
                '#a50f15',
            ], // Reds
        },
        methods: {
            multiply: [100], // Convert from people/hectare to people/km2
        },
        opacity: 0.9,
    },
]
*/

export const getEarthEngineLayer = (id) =>
    earthEngineLayers.find((l) => l.layerId === id)
