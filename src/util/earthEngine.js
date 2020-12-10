import i18n from '@dhis2/d2-i18n';
import { getYear, formatStartEndDate } from './time';

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
        period: 'year',
        collectionLabel: i18n.t('Select year'),
        collectionFilters: year => [
            {
                type: 'eq',
                arguments: ['year', year],
            },
        ],
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: i18n.t('Min people'),
        maxLabel: i18n.t('Max people'),
        aggregation: 'mosaic',
        resolution: 100,
        projection: 'EPSG:4326',
        // methods: {
        //    multiply: [100], // Convert from people/hectare to people/km2
        // },
        mask: true,
        value: value => Math.round(value),
        img: 'images/population.png',
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

        minValue: 0,
        maxValue: 8848,
        minLabel: i18n.t('Min meters'),
        maxLabel: i18n.t('Max meters'),
        band: 'elevation',
        mask: true,
        img: 'images/elevation.png',
        params: {
            min: 0,
            max: 1500,
            palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
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
        period: 'date',
        value(value) {
            return value.toFixed(1);
        },
        minValue: 0,
        maxValue: 100,
        minLabel: i18n.t('Min mm'),
        maxLabel: i18n.t('Max mm'),
        band: 'precipitation',
        mask: true,
        img: 'images/precipitation.png',
        params: {
            min: 0,
            max: 100,
            palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594', // Blues
        },
        opacity: 0.9,
    },
];

export const getEarthEngineLayer = id =>
    earthEngineLayers().find(l => l.datasetId === id);

export const getCollection = id =>
    new Promise((resolve, reject) => {
        const { period } = getEarthEngineLayer(id);

        // console.log('period', period);

        let imageCollection = ee.ImageCollection(id);
        let select;

        // imageCollection.getInfo(console.log);

        if (period === 'year') {
            imageCollection = imageCollection
                .distinct(period)
                .sort(period, false);
            select = [period];
        } else if (period === 'date') {
            imageCollection = imageCollection.sort('system:time_start', false);
            select = ['year', 'system:time_start', 'system:time_end'];
        }

        // console.log('imageCollection', imageCollection);

        // ee.FeatureCollection(imageCollection).getInfo(console.log);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(select, null, false);

        // featureCollection.getInfo(console.log);

        featureCollection.getInfo(
            ({ features }) =>
                resolve(
                    features.map(({ properties }) => ({
                        id: properties[period],
                        name: String(properties[period]),
                    }))
                ),
            reject
        );
    });

export const collections = {
    'WorldPop/GP/100m/pop': resolve => {
        // Population density
        const imageCollection = ee
            .ImageCollection('WorldPop/GP/100m/pop')
            .distinct('year')
            .sort('year', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['year'], null, false);

        featureCollection.getInfo(data => {
            resolve(
                data.features.map(feature => ({
                    id: feature.properties['year'],
                    name: String(feature.properties['year']), // TODO: Support numbers in d2-ui cmp
                }))
            );
        });
    },
    'WorldPop/POP': resolve => {
        // Population density
        const imageCollection = ee
            .ImageCollection('WorldPop/POP')
            .filterMetadata('UNadj', 'equals', 'yes')
            .distinct('year')
            .sort('year', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['year'], null, false);

        featureCollection.getInfo(data => {
            resolve(
                data.features.map(feature => ({
                    id: feature.properties['year'],
                    name: String(feature.properties['year']), // TODO: Support numbers in d2-ui cmp
                }))
            );
        });
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': resolve => {
        // Nighttime lights
        const imageCollection = ee
            .ImageCollection('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS')
            .distinct('system:time_start') // TODO: Why two images for some years?
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(feature => ({
                    id: feature.id,
                    name: String(
                        getYear(feature.properties['system:time_start'])
                    ),
                }))
            )
        );
    },
    'UCSB-CHG/CHIRPS/PENTAD': resolve => {
        // Precipitation
        const imageCollection = ee
            .ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
            .filterDate('2000-01-01', '2025-01-01')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(f => ({
                    id: f.id,
                    year: new Date(
                        f.properties['system:time_start']
                    ).getFullYear(),
                    name: formatStartEndDate(
                        f.properties['system:time_start'],
                        f.properties['system:time_end'] - 7200001, // Minus 2 hrs to end the day before
                        null,
                        false
                    ),
                }))
            )
        );
    },
    'MODIS/006/MOD11A2': resolve => {
        // Temperature
        const imageCollection = ee
            .ImageCollection('MODIS/006/MOD11A2')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(f => ({
                    id: f.id,
                    year: new Date(
                        f.properties['system:time_start']
                    ).getFullYear(),
                    name: formatStartEndDate(
                        f.properties['system:time_start'],
                        f.properties['system:time_end'] - 7200001, // Minus 2 hrs to end the day before
                        null,
                        false
                    ),
                }))
            )
        );
    },
    'MODIS/051/MCD12Q1': resolve => {
        // Landcover
        const imageCollection = ee
            .ImageCollection('MODIS/051/MCD12Q1')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(feature => ({
                    id: feature.id,
                    name: String(
                        getYear(feature.properties['system:time_start'])
                    ),
                }))
            )
        );
    },
};

/*
{
    layer: 'earthEngine',
    datasetId: 'WorldPop/GP/100m/pop',
    type: i18n.t('Population NEW!'),
    img: 'images/population.png',
    params: {
        min: 0,
        max: 10,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
    },
    opacity: 0.9,
},
{
    layer: 'earthEngine',
    datasetId: 'WorldPop/POP',
    type: i18n.t('Population density'),
    img: 'images/population.png',
    params: {
        min: 0,
        max: 1000,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15', // Reds
    },
    opacity: 0.9,
},
{
    layer: 'earthEngine',
    datasetId: 'USGS/SRTMGL1_003',
    type: i18n.t('Elevation'),
    img: 'images/elevation.png',
    params: {
        min: 0,
        max: 1500,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404', // YlOrBr
    },
    opacity: 0.9,
},
{
    layer: 'earthEngine',
    datasetId: 'MODIS/006/MOD11A2',
    type: i18n.t('Temperature'),
    img: 'images/temperature.png',
    params: {
        min: 0,
        max: 50,
        palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#99000d', // Reds
    },
    opacity: 0.9,
},
{
    layer: 'earthEngine',
    datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
    type: i18n.t('Precipitation'),
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
    datasetId: 'MODIS/051/MCD12Q1',
    type: i18n.t('Landcover'),
    img: 'images/landcover.png',
    opacity: 0.9,
},
{
    layer: 'earthEngine',
    datasetId: 'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS',
    type: i18n.t('Nighttime lights'),
    img: 'images/nighttime.png',
    params: {
        min: 0,
        max: 63,
        palette: '#ffffd4,#fee391,#fec44f,#fe9929,#ec7014,#cc4c02,#8c2d04', // YlOrBr
    },
    opacity: 0.9,
},
*/

/*
const getDatasets = () => ({
    'WorldPop/GP/100m/pop': {
        // Population density
        description: i18n.t('Estimated residential population per hectare.'),
        collectionLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: i18n.t('Min people'),
        maxLabel: i18n.t('Max people'),
    },
    'WorldPop/POP': {
        // Population density
        description: i18n.t(
            "Population density estimates with national totals adjusted to match UN population division estimates. Try a different year if you don't see data for your country."
        ),
        collectionLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minLabel: i18n.t('Min people'),
        maxLabel: i18n.t('Max people'),
    },
    'USGS/SRTMGL1_003': {
        // Elevation
        description: i18n.t(
            'Elevation above sea-level. You can adjust the min and max values so it better representes the terrain in your region.'
        ),
        minValue: 0,
        maxValue: 8848,
        minLabel: i18n.t('Min meters'),
        maxLabel: i18n.t('Max meters'),
    },
    'UCSB-CHG/CHIRPS/PENTAD': {
        // Precipitation
        description: i18n.t(
            'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.'
        ),
        minValue: 0,
        maxValue: 100,
        minLabel: i18n.t('Min mm'),
        maxLabel: i18n.t('Max mm'),
    },
    'MODIS/006/MOD11A2': {
        // Temperature
        description: i18n.t(
            'Land surface temperatures collected from satellite in 8 days periods. Blank spots will appear in areas with a persistent cloud cover.'
        ),
        minValue: -100,
        maxValue: 100,
        minLabel: i18n.t('Min °C'),
        maxLabel: i18n.t('Max °C'),
    },
    'MODIS/051/MCD12Q1': {
        // Landcover
        description: i18n.t(
            '17 distinct landcover types collected from satellites.'
        ),
        valueLabel: i18n.t('Select year'),
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': {
        // Nighttime lights
        description: i18n.t(
            'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.'
        ),
        valueLabel: i18n.t('Select year'),
        minValue: 0,
        maxValue: 63,
    },
});
*/

/*
const collectionFilters = {
    'WorldPop/GP/100m/pop': year => [
        {
            type: 'eq',
            arguments: ['year', year],
        },
    ],
    'WorldPop/POP': year => [
        {
            type: 'eq',
            arguments: ['year', year],
        },
        {
            type: 'eq',
            arguments: ['UNadj', 'yes'],
        },
    ],
};
*/

/*
const getDatasets = () => ({
    'USGS/SRTMGL1_003': {
        name: i18n.t('Elevation'),
        band: 'elevation',
        mask: true,
        legend: {
            unit: i18n.t('metres'),
            description: i18n.t('Elevation above sea-level.'),
            source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/USGS%2FSRTMGL1_003',
        },
    },
    'WorldPop/GP/100m/pop': {
        name: i18n.t('Population NEW!'),
        aggregation: 'mosaic',
        mask: true,
        // methods: {
        //    multiply: [100], // Convert from people/hectare to people/km2
        // },
        resolution: 100,
        projection: 'EPSG:4326',
        value(value) {
            return Math.round(value);
        },
        legend: {
            unit: i18n.t('people per hectare'),
            description: i18n.t('Estimated residential population.'),
            source: 'WorldPop / Google Earth Engine',
            sourceUrl:
                'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop',
        },
    },
    'WorldPop/POP': {
        name: i18n.t('Population density'),
        aggregation: 'mosaic',
        mask: true,
        methods: {
            multiply: [100], // Convert from people/hectare to people/km2
        },
        resolution: 100,
        projection: 'EPSG:4326',
        value(value) {
            return Math.round(value);
        },
        legend: {
            unit: i18n.t('people per km²'),
            description: i18n.t(
                'Population density estimates with national totals adjusted to match UN population division estimates.'
            ),
            source: 'WorldPop / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/WorldPop%2FPOP',
        },
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': {
        name: i18n.t('Nighttime lights'),
        band: 'stable_lights',
        mask: true,
        popup: '{name}: {value}',
        legend: {
            unit: i18n.t('light intensity'),
            description: i18n.t(
                'Light intensity from cities, towns, and other sites with persistent lighting, including gas flares.'
            ),
            source: 'NOAA / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/NOAA%2FDMSP-OLS%2FNIGHTTIME_LIGHTS',
        },
    },
    'UCSB-CHG/CHIRPS/PENTAD': {
        name: i18n.t('Precipitation'),
        band: 'precipitation',
        mask: true,
        value(value) {
            return value.toFixed(1);
        },
        legend: {
            unit: i18n.t('millimeter'),
            description: i18n.t(
                'Precipitation collected from satellite and weather stations on the ground.'
            ),
            source: 'UCSB / CHG / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/UCSB-CHG%2FCHIRPS%2FPENTAD',
        },
    },
    'MODIS/006/MOD11A2': {
        name: i18n.t('Temperature'),
        band: 'LST_Day_1km',
        mask: true,
        methods: {
            toFloat: [],
            multiply: [0.02],
            subtract: [273.15],
        },
        value(value) {
            return Math.round(value);
        },
        popup: '{name}: {value}{unit}',
        legend: {
            unit: i18n.t('°C during daytime'),
            description: i18n.t(
                'Land surface temperatures collected from satellite. Blank spots will appear in areas with a persistent cloud cover.'
            ),
            source: 'NASA LP DAAC / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/MODIS%2FMOD11A2',
        },
    },
    'MODIS/051/MCD12Q1': {
        name: i18n.t('Landcover'),
        band: 'Land_Cover_Type_1',
        params: {
            min: 0,
            max: 17,
            palette:
                'aec3d6,162103,235123,399b38,38eb38,39723b,6a2424,c3a55f,b76124,d99125,92af1f,10104c,cdb400,cc0202,332808,d7cdcc,f7e174,743411',
        },
        mask: false,
        legend: {
            description: i18n.t(
                'Distinct landcover types collected from satellites.'
            ),
            source: 'NASA LP DAAC / Google Earth Engine',
            sourceUrl:
                'https://code.earthengine.google.com/dataset/MODIS/051/MCD12Q1',
            items: [
                {
                    color: '#aec3d6',
                    name: i18n.t('Water'),
                },
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
                    color: '#743411',
                    name: i18n.t('Unclassified'),
                },
            ],
        },
        popup: '{name}: {value}',
    },
});
*/
