import i18n from '@dhis2/d2-i18n'
import { EARTH_ENGINE_LAYER } from './layers.js'

export const earthEngineLayers = [
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'MODIS/006/MCD12Q1/cropland',
        img: 'images/landcover.png',
        datasetId: 'USGS/GFSAD1000_V1',
        format: 'ImageCollection',
        name: 'Cropland',
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
    },
    {
        // TODO: Remove this dataset
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'RESOLVE/ECOREGIONS/2017',
        datasetId: 'RESOLVE/ECOREGIONS/2017',
        format: 'FeatureCollection',
        name: 'Ecoregions',
        description: '',
        source: 'RESOLVE / Google Earth Engine',
        style: {
            byProperty: 'COLOR',
        },
        opacity: 0.9,
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'GOOGLE/Research/open-buildings/v1/polygons',
        img: 'images/buildings.png',
        datasetId: 'GOOGLE/Research/open-buildings/v1/polygons',
        format: 'FeatureCollection',
        name: 'Building footprints',
        description: 'Estimated number of people living in an area',
        // notice: 'Building counts are only available for smaller organisation unit areas.',
        // error: 'Select a smaller area or single organization unit to see the count of buildings.',
        source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
        unit: 'Number of buildings',
        aggregations: ['count'],
        defaultAggregations: ['count'],
        style: {
            color: '#FFA500', // TODO: Not in use
            width: 1,
        },
        opacity: 0.9,
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'GOOGLE/Research/open-buildings/v1/polygons/gt500',
        img: 'images/buildings.png',
        datasetId: 'GOOGLE/Research/open-buildings/v1/polygons',
        format: 'FeatureCollection',
        name: 'Buildings > 500 m²',
        description: 'Estimated number of people living in an area',
        source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
        unit: 'Number of buildings',
        aggregations: ['count'],
        defaultAggregations: ['count'],
        filters: [
            {
                type: 'gt',
                arguments: ['area_in_meters', 500],
            },
        ],
        style: {
            color: '#FFA500',
            width: 1,
        },
        opacity: 0.9,
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'MODIS/006/MCD12Q1',
        img: 'images/landcover.png',
        datasetId: 'MODIS/061/MCD12Q1',
        format: 'ImageCollection',
        name: 'Landcover',
        description: 'Distinct landcover types collected from satellites.',
        source: 'NASA LP DAAC / Google Earth Engine',
        periodType: 'yearly',
        band: 'LC_Type1',
        defaultAggregations: 'percentage',
        popup: '{name}: {value}',
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        style: [
            {
                value: 1,
                color: '#162103',
                name: 'Evergreen Needleleaf forest',
            },
            {
                value: 2,
                color: '#235123',
                name: 'Evergreen Broadleaf forest',
            },
            {
                value: 3,
                name: 'Deciduous Needleleaf forest',
                color: '#399b38',
            },
            {
                value: 4,
                name: 'Deciduous Broadleaf forest',
                color: '#38eb38',
            },
            {
                value: 5,
                name: 'Mixed forest',
                color: '#39723b',
            },
            {
                value: 6,
                name: 'Closed shrublands',
                color: '#6a2424',
            },
            {
                value: 7,
                name: 'Open shrublands',
                color: '#c3a55f',
            },
            {
                value: 8,
                name: 'Woody savannas',
                color: '#b76124',
            },
            {
                value: 9,
                name: 'Savannas',
                color: '#d99125',
            },
            {
                value: 10,
                name: 'Grasslands',
                color: '#92af1f',
            },
            {
                value: 11,
                name: 'Permanent wetlands',
                color: '#10104c',
            },
            {
                value: 12,
                name: 'Croplands',
                color: '#cdb400',
            },
            {
                value: 13,
                name: 'Urban and built-up',
                color: '#cc0202',
            },
            {
                value: 14,
                name: 'Cropland/Natural vegetation mosaic',
                color: '#332808',
            },
            {
                value: 15,
                name: 'Snow and ice',
                color: '#d7cdcc',
            },
            {
                value: 16,
                name: 'Barren or sparsely vegetated',
                color: '#f7e174',
            },
            {
                value: 17,
                name: 'Water',
                color: '#aec3d6',
            },
        ],
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'COPERNICUS/Landcover/100m/Proba-V-C3/Global',
        img: 'images/landcover.png',
        datasetId: 'COPERNICUS/Landcover/100m/Proba-V-C3/Global',
        format: 'ImageCollection',
        name: 'Landcover Copernicus',
        description: 'Distinct landcover types collected from satellites.',
        source: 'Copernicus / Google Earth Engine',
        periodType: 'yearly',
        band: 'discrete_classification',
        defaultAggregations: 'percentage',
        popup: '{name}: {value}',
        filters: [
            {
                type: 'eq',
                arguments: ['system:index', '$1'],
            },
        ],
        style: [
            {
                value: 0,
                name: 'Unknown',
                color: '#282828',
            },
            {
                value: 20,
                name: 'Shrubs',
                color: '#ffbb22',
            },
            {
                value: 30,
                name: 'Herbaceous vegetation',
                color: '#ffff4c',
            },
            {
                value: 40,
                name: 'Agriculture',
                color: '#f096ff',
            },
            {
                value: 50,
                name: 'Urban / built up',
                color: '#fa0000',
            },
            {
                value: 60,
                name: 'Bare / sparse vegetation',
                color: '#b4b4b4',
            },
            {
                value: 70,
                name: 'Snow and ice',
                color: '#f0f0f0',
            },
            {
                value: 80,
                name: 'Permanent water bodies',
                color: '#0032c8',
            },
            {
                value: 90,
                name: 'Herbaceous wetland',
                color: '#0096a0',
            },
            {
                value: 100,
                name: 'Moss and lichen',
                color: '#fae6a0',
            },
            {
                value: 111,
                name: 'Closed forest, evergreen needle leaf',
                color: '#58481f',
            },
            {
                value: 112,
                name: 'Closed forest, evergreen broad leaf',
                color: '#009900',
            },
            {
                value: 113,
                name: 'Closed forest, deciduous needle leaf',
                color: '#70663e',
            },
            {
                value: 114,
                name: 'Closed forest, deciduous broad leaf',
                color: '#00cc00',
            },
            {
                value: 115,
                name: 'Closed forest, mixed',
                color: '#4e751f',
            },
            {
                value: 116,
                name: 'Closed forest, other',
                color: '#007800',
            },
            {
                value: 121,
                name: 'Open forest, evergreen needle leaf',
                color: '#666000',
            },
            {
                value: 122,
                name: 'Open forest, evergreen broad leaf',
                color: '#8db400',
            },
            {
                value: 123,
                name: 'Open forest, deciduous needle leaf',
                color: '#8d7400',
            },
            {
                value: 124,
                name: 'Open forest, deciduous broad leaf',
                color: '#a0dc00',
            },
            {
                value: 125,
                name: 'Open forest, mixed',
                color: '#929900',
            },
            {
                value: 126,
                name: 'Open forest, other',
                color: '#648c00',
            },
            {
                value: 200,
                name: 'Water',
                color: '#000080',
            },
        ],
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
        layerId: 'ECMWF/ERA5_LAND/DAILY_AGGR/total_precipitation_sum',
        datasetId: 'ECMWF/ERA5_LAND/DAILY_AGGR',
        format: 'ImageCollection',
        name: 'Precipitation daily',
        description: 'Precipitation',
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        unit: 'millimeter',
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        periodType: 'daily',
        periodReducer: 'sum',
        band: 'total_precipitation_sum',
        filters: [
            {
                type: 'date',
                arguments: ['$1', '$2'],
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
            max: 10,
            palette: [
                '#eff3ff',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#3182bd',
                '#08519c',
            ],
        },
        opacity: 0.9,
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
        layerId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR/total_precipitation_sum',
        datasetId: 'ECMWF/ERA5_LAND/MONTHLY_AGGR',
        format: 'ImageCollection',
        name: 'Precipitation monthly',
        description: 'Precipitation',
        source: 'Copernicus Climate Data Store / Google Earth Engine',
        unit: 'millimeter',
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        periodType: 'byYear',
        band: 'total_precipitation_sum',
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
            max: 700,
            palette: [
                '#f7fbff',
                '#deebf7',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#4292c6',
                '#2171b5',
                '#084594',
            ],
        },
        opacity: 0.9,
    },
    /*
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers',
        datasetId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers',
        format: 'FeatureCollection',
        name: 'Rivers',
        description: '',
        source: 'WWF / Google Earth Engine',
        style: {
            byProperty: 'COLOR',
        },
        opacity: 0.9,
    },
    */
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers_FeatureView',
        datasetId: 'WWF/HydroSHEDS/v1/FreeFlowingRivers',
        format: 'FeatureView',
        name: 'Rivers',
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
    },
    {
        layerType: EARTH_ENGINE_LAYER,
        layerId: 'ECMWF/CAMS/NRT/NO2',
        // img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
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
        // img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
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
        // img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
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
        // img: 'images/precipitation.png',
        // id: 'earthengine_precipitation-era5',
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
        layerId: 'GOOGLE/Research/open-buildings/v1/polygons',
        datasetId: 'GOOGLE/Research/open-buildings/v1/polygons',
        format: 'FeatureCollection',
        name: i18n.t('Building footprints'),
        unit: i18n.t('Number of buildings'),
        description: i18n.t(
            'The outlines of buildings derived from high-resolution satellite imagery. Only for the continent of Africa.'
        ),
        notice: i18n.t(
            'Building counts are only available for smaller organisation unit areas.'
        ),
        error: i18n.t(
            'Select a smaller area or single organization unit to see the count of buildings.'
        ),
        source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
        sourceUrl: 'https://sites.research.google/open-buildings/',
        img: 'images/buildings.png',
        aggregations: ['count'],
        defaultAggregations: ['count'],
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'UCSB-CHG/CHIRPS/PENTAD',
        datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
        name: i18n.t('Precipitation'),
        unit: i18n.t('millimeter'),
        description: i18n.t(
            'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.'
        ),
        source: 'UCSB / CHG / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/UCSB-CHG%2FCHIRPS%2FPENTAD',
        periodType: 'Custom',
        band: 'precipitation',
        aggregations: ['min', 'max', 'mean', 'median', 'stdDev', 'variance'],
        defaultAggregations: ['mean', 'min', 'max'],
        mask: true,
        img: 'images/precipitation.png',
        params: {
            min: 0,
            max: 100,
            palette: [
                '#eff3ff',
                '#c6dbef',
                '#9ecae1',
                '#6baed6',
                '#3182bd',
                '#08519c',
            ], // Blues
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        layerId: 'MODIS/006/MCD12Q1', // Layer id kept for backward compability for saved maps
        datasetId: 'MODIS/061/MCD12Q1', // No longer in use: 'MODIS/006/MCD12Q1' / 'MODIS/051/MCD12Q1',
        name: i18n.t('Landcover'),
        description: i18n.t(
            'Distinct landcover types collected from satellites.'
        ),
        source: 'NASA LP DAAC / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MCD12Q1',
        periodType: 'Yearly',
        band: 'LC_Type1',
        filters: ({ id, name, year }) => [{
            type: 'eq',
            arguments: ['system:index', String(id)],
            name,
            year,
        }],
        defaultAggregations: 'percentage',
        legend: {
            items: [
                // http://www.eomf.ou.edu/static/IGBP.pdf
                {
                    id: 1,
                    name: i18n.t('Evergreen Needleleaf forest'),
                    color: '#162103',
                },
                {
                    id: 2,
                    name: i18n.t('Evergreen Broadleaf forest'),
                    color: '#235123',
                },
                {
                    id: 3,
                    name: i18n.t('Deciduous Needleleaf forest'),
                    color: '#399b38',
                },
                {
                    id: 4,
                    name: i18n.t('Deciduous Broadleaf forest'),
                    color: '#38eb38',
                },
                {
                    id: 5,
                    name: i18n.t('Mixed forest'),
                    color: '#39723b',
                },
                {
                    id: 6,
                    name: i18n.t('Closed shrublands'),
                    color: '#6a2424',
                },
                {
                    id: 7,
                    name: i18n.t('Open shrublands'),
                    color: '#c3a55f',
                },
                {
                    id: 8,
                    name: i18n.t('Woody savannas'),
                    color: '#b76124',
                },
                {
                    id: 9,
                    name: i18n.t('Savannas'),
                    color: '#d99125',
                },
                {
                    id: 10,
                    name: i18n.t('Grasslands'),
                    color: '#92af1f',
                },
                {
                    id: 11,
                    name: i18n.t('Permanent wetlands'),
                    color: '#10104c',
                },
                {
                    id: 12,
                    name: i18n.t('Croplands'),
                    color: '#cdb400',
                },
                {
                    id: 13,
                    name: i18n.t('Urban and built-up'),
                    color: '#cc0202',
                },
                {
                    id: 14,
                    name: i18n.t('Cropland/Natural vegetation mosaic'),
                    color: '#332808',
                },
                {
                    id: 15,
                    name: i18n.t('Snow and ice'),
                    color: '#d7cdcc',
                },
                {
                    id: 16,
                    name: i18n.t('Barren or sparsely vegetated'),
                    color: '#f7e174',
                },
                {
                    id: 17,
                    name: i18n.t('Water'),
                    color: '#aec3d6',
                },
            ],
        },
        mask: false,
        popup: '{name}: {value}',
        img: 'images/landcover.png',
        opacity: 0.9,
    },
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
    {
        layer: EARTH_ENGINE_LAYER,
        legacy: true, // Kept for backward compability
        layerId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
        datasetId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
        name: i18n.t('Nighttime lights'),
        unit: i18n.t('light intensity'),
        description: i18n.t(
            'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.'
        ),
        source: 'NOAA / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/NOAA%2FDMSP-OLS%2FNIGHTTIME_LIGHTS',
        periodType: 'Yearly',
        band: 'stable_lights',
        mask: true,
        img: 'images/nighttime.png',
        params: {
            min: 0,
            max: 63,
            palette: [
                '#ffffd4',
                '#fee391',
                '#fec44f',
                '#fe9929',
                '#ec7014',
                '#cc4c02',
                '#8c2d04',
            ], // YlOrBr
        },
        opacity: 0.9,
    },
]
*/

export const getEarthEngineLayer = (id) =>
    earthEngineLayers.find((l) => l.layerId === id)
