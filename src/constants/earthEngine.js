import i18n from '@dhis2/d2-i18n';

export const earthEngineLayers = () => [
    {
        layer: 'earthEngine',
        datasetId: 'WorldPop/GP/100m/pop',
        name: i18n.t('Population'),
        unit: i18n.t('people per hectare'),
        description: i18n.t('Estimated residential population per hectare.'),
        source: 'WorldPop / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
        img: 'images/population.png',
        defaultAggregations: ['sum', 'min', 'max', 'mean'],
        periodType: 'Yearly',
        filters: ({ id, name }) => [
            {
                name,
                type: 'eq',
                arguments: ['year', id],
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
        layer: 'earthEngine',
        datasetId: 'USGS/SRTMGL1_003',
        name: i18n.t('Elevation'),
        unit: i18n.t('metres'),
        description: i18n.t('Elevation above sea-level.'),
        source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
        sourceUrl:
            'https://explorer.earthengine.google.com/#detail/USGS%2FSRTMGL1_003',
        img: 'images/elevation.png',
        defaultAggregations: ['min', 'max', 'mean'],
        band: 'elevation',
        params: {
            min: 0,
            max: 1500,
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'ECMWF/ERA5/DAILY',
        name: i18n.t('Precipitation NEW'),
        // unit: i18n.t('millimeter'),
        unit: i18n.t('meter'),
        description: i18n.t(
            'Total precipitation values. Data is available from 1979 to three months from real-time.'
        ),
        source:
            'ECMWF / Copernicus Climate Change Service / Google Earth Engine',
        sourceUrl:
            'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_DAILY',
        periodType: 'Daily',
        band: 'total_precipitation',
        defaultAggregations: ['sum', 'min', 'max', 'mean'],
        mask: true,
        img: 'images/precipitation.png',
        params: {
            min: 0,
            max: 0.02,
            palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
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
        defaultAggregations: ['sum', 'min', 'max', 'mean'],
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
        layer: 'earthEngine',
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
        defaultAggregations: ['min', 'max', 'mean'],
        periodType: 'Custom',
        band: 'LST_Day_1km',
        mask: true,
        methods: {
            // TODO: Calculate from farenheit to celcius in app?
            toFloat: [],
            multiply: [0.02],
            subtract: [273.15],
        },
        // value(value) {
        //     return Math.round(value);
        // },
        // minValue: -100,
        // maxValue: 100,
        // popup: '{name}: {value}{unit}',
        // type: i18n.t('Temperature'),
        params: {
            min: 0,
            max: 50,
            palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
        },
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
        datasetId: 'MODIS/006/MCD12Q1', // No longer in use: 'MODIS/051/MCD12Q1',
        name: i18n.t('Landcover'),
        description: i18n.t(
            'Distinct landcover types collected from satellites.'
        ),
        source: 'NASA LP DAAC / Google Earth Engine',
        sourceUrl:
            'https://code.earthengine.google.com/dataset/MODIS/051/MCD12Q1',
        periodType: 'Yearly',
        band: 'LC_Type1',
        filters: ({ id, name }) => [
            {
                name,
                type: 'eq',
                arguments: ['year', id],
            },
            /*
            {
                name,
                type: 'eq',
                arguments: ['system:index', `${id}_01_01`],
            },
            */
        ],
        params: {
            // TODO: Create from legend below - possible to read from metadata?
            min: 1,
            max: 17,
            palette:
                '162103,235123,399b38,38eb38,39723b,6a2424,c3a55f,b76124,d99125,92af1f,10104c,cdb400,cc0202,332808,d7cdcc,f7e174,aec3d6',
        },
        legend: {
            items: [
                // http://www.eomf.ou.edu/static/IGBP.pdf
                {
                    color: '#162103',
                    name: i18n.t('Evergreen Needleleaf forest'),
                },
                {
                    color: '#235123',
                    name: i18n.t('Evergreen Broadleaf forest'),
                },
                {
                    color: '#399b38',
                    name: i18n.t('Deciduous Needleleaf forest'),
                },
                {
                    color: '#38eb38',
                    name: i18n.t('Deciduous Broadleaf forest'),
                },
                {
                    color: '#39723b',
                    name: i18n.t('Mixed forest'),
                },
                {
                    color: '#6a2424',
                    name: i18n.t('Closed shrublands'),
                },
                {
                    color: '#c3a55f',
                    name: i18n.t('Open shrublands'),
                },
                {
                    color: '#b76124',
                    name: i18n.t('Woody savannas'),
                },
                {
                    color: '#d99125',
                    name: i18n.t('Savannas'),
                },
                {
                    color: '#92af1f',
                    name: i18n.t('Grasslands'),
                },
                {
                    color: '#10104c',
                    name: i18n.t('Permanent wetlands'),
                },
                {
                    color: '#cdb400',
                    name: i18n.t('Croplands'),
                },
                {
                    color: '#cc0202',
                    name: i18n.t('Urban and built-up'),
                },
                {
                    color: '#332808',
                    name: i18n.t('Cropland/Natural vegetation mosaic'),
                },
                {
                    color: '#d7cdcc',
                    name: i18n.t('Snow and ice'),
                },
                {
                    color: '#f7e174',
                    name: i18n.t('Barren or sparsely vegetated'),
                },
                {
                    color: '#aec3d6',
                    name: i18n.t('Water'),
                },
            ],
        },
        mask: false,
        popup: '{name}: {value}',
        img: 'images/landcover.png',
        opacity: 0.9,
    },
    {
        layer: 'earthEngine',
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
        popup: '{name}: {value}',
        valueLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: 63,
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
