import i18n from '@dhis2/d2-i18n';
import { defaultFilters } from '../util/earthEngine';
import { EARTH_ENGINE_LAYER } from './layers';

export const earthEngineLayers = () => [
    {
        layer: EARTH_ENGINE_LAYER,
        datasetId: 'WorldPop/GP/100m/pop',
        name: i18n.t('Population'),
        unit: i18n.t('people per hectare'),
        description: i18n.t('Estimated number of people living in an area.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
        img: 'images/population.png',
        defaultAggregation: ['sum', 'mean'],
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
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        datasetId: 'WorldPop/GP/100m/pop_age_sex',
        name: i18n.t('Population age groups'),
        unit: i18n.t('people per hectare'),
        description: i18n.t(
            'Estimated number of people living in an area, grouped by age and gender.'
        ),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex',
        img: 'images/population.png',
        periodType: 'Yearly',
        defaultAggregation: ['sum', 'mean'],
        bands: [
            {
                id: 'M_0',
                name: i18n.t('Men 0 - 1 years'),
            },
            {
                id: 'M_1',
                name: i18n.t('Men 1 - 4 years'),
            },
            {
                id: 'M_5',
                name: i18n.t('Men 5 - 9 years'),
            },
            {
                id: 'M_10',
                name: i18n.t('Men 10 - 14 years'),
            },
            {
                id: 'M_15',
                name: i18n.t('Men 15 - 19 years'),
            },
            {
                id: 'M_20',
                name: i18n.t('Men 20 - 24 years'),
            },
            {
                id: 'M_25',
                name: i18n.t('Men 25 - 29 years'),
            },
            {
                id: 'M_30',
                name: i18n.t('Men 30 - 34 years'),
            },
            {
                id: 'M_35',
                name: i18n.t('Men 35 - 39 years'),
            },
            {
                id: 'M_40',
                name: i18n.t('Men 40 - 44 years'),
            },
            {
                id: 'M_45',
                name: i18n.t('Men 45 - 49 years'),
            },
            {
                id: 'M_50',
                name: i18n.t('Men 50 - 54 years'),
            },
            {
                id: 'M_55',
                name: i18n.t('Men 55 - 59 years'),
            },
            {
                id: 'M_60',
                name: i18n.t('Men 60 - 64 years'),
            },
            {
                id: 'M_65',
                name: i18n.t('Men 65 - 69 years'),
            },
            {
                id: 'M_70',
                name: i18n.t('Men 70 - 74 years'),
            },
            {
                id: 'M_75',
                name: i18n.t('Men 75 - 79 years'),
            },
            {
                id: 'M_80',
                name: i18n.t('Men 80 years and above'),
            },
            {
                id: 'F_0',
                name: i18n.t('Women 0 - 1 years'),
            },
            {
                id: 'F_1',
                name: i18n.t('Women 1 - 4 years'),
            },
            {
                id: 'F_5',
                name: i18n.t('Women 5 - 9 years'),
            },
            {
                id: 'F_10',
                name: i18n.t('Women 10 - 14 years'),
            },
            {
                id: 'F_15',
                name: i18n.t('Women 15 - 19 years'),
            },
            {
                id: 'F_20',
                name: i18n.t('Women 20 - 24 years'),
            },
            {
                id: 'F_25',
                name: i18n.t('Women 25 - 29 years'),
            },
            {
                id: 'F_30',
                name: i18n.t('Women 30 - 34 years'),
            },
            {
                id: 'F_35',
                name: i18n.t('Women 35 - 39 years'),
            },
            {
                id: 'F_40',
                name: i18n.t('Women 40 - 44 years'),
            },
            {
                id: 'F_45',
                name: i18n.t('Women 45 - 49 years'),
            },
            {
                id: 'F_50',
                name: i18n.t('Women 50 - 54 years'),
            },
            {
                id: 'F_55',
                name: i18n.t('Women 55 - 59 years'),
            },
            {
                id: 'F_60',
                name: i18n.t('Women 60 - 64 years'),
            },
            {
                id: 'F_65',
                name: i18n.t('Women 65 - 69 years'),
            },
            {
                id: 'F_70',
                name: i18n.t('Women 70 - 74 years'),
                multiple: true,
            },
            {
                id: 'F_75',
                name: i18n.t('Women 75 - 79 years'),
            },
            {
                id: 'F_80',
                name: i18n.t('Women 80 years and above'),
            },
        ],
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
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        datasetId: 'USGS/SRTMGL1_003',
        name: i18n.t('Elevation'),
        unit: i18n.t('metres'),
        description: i18n.t('Elevation above sea-level.'),
        source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/USGS%2FSRTMGL1_003',
        img: 'images/elevation.png',
        defaultAggregation: ['min', 'max', 'mean'],
        band: 'elevation',
        params: {
            min: 0,
            max: 1500,
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
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
        defaultAggregation: ['sum', 'min', 'max', 'mean'],
        mask: true,
        img: 'images/precipitation.png',
        params: {
            min: 0,
            max: 100,
            palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        datasetId: 'MODIS/006/MOD11A2',
        name: i18n.t('Temperature'),
        unit: i18n.t('°C during daytime'),
        description: i18n.t(
            'Land surface temperatures collected from satellite. Blank spots will appear in areas with a persistent cloud cover.'
        ),
        source: 'NASA LP DAAC / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/MODIS%2FMOD11A2',
        img: 'images/temperature.png',
        defaultAggregation: ['min', 'max', 'mean'],
        periodType: 'Custom',
        band: 'LST_Day_1km',
        mask: true,
        methods: {
            toFloat: [],
            multiply: [0.02],
            subtract: [273.15],
        },
        params: {
            min: 0,
            max: 50,
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        datasetId: 'MODIS/006/MCD12Q1', // No longer in use: 'MODIS/051/MCD12Q1',
        name: i18n.t('Landcover'),
        description: i18n.t(
            'Distinct landcover types collected from satellites.'
        ),
        source: 'NASA LP DAAC / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/MODIS_006_MCD12Q1',
        periodType: 'Yearly',
        band: 'LC_Type1',
        filters: defaultFilters,
        defaultAggregation: 'percentage',
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
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
        },
        methods: {
            multiply: [100], // Convert from people/hectare to people/km2
        },
        opacity: 0.9,
    },
    {
        layer: EARTH_ENGINE_LAYER,
        legacy: true, // Kept for backward compability
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
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#ec7014,#cc4c02,#8c2d04', // YlOrBr
        },
        opacity: 0.9,
    },
];

export const getEarthEngineLayer = id =>
    earthEngineLayers().find(l => l.datasetId === id);
