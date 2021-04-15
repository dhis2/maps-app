import i18n from '@dhis2/d2-i18n';

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
    'MODIS/006/MCD12Q1': {
        name: i18n.t('Landcover'),
        band: 'LC_Type1',
        params: {
            min: 1,
            max: 17,
            palette:
                '162103,235123,399b38,38eb38,39723b,6a2424,c3a55f,b76124,d99125,92af1f,10104c,cdb400,cc0202,332808,d7cdcc,f7e174,aec3d6',
        },
        mask: false,
        legend: {
            description: i18n.t(
                'Distinct landcover types collected from satellites.'
            ),
            source: 'NASA LP DAAC / Google Earth Engine',
            sourceUrl:
                'https://developers.google.com/earth-engine/datasets/catalog/MODIS_006_MCD12Q1',
            items: [
                // http://www.eomf.ou.edu/static/IGBP.pdf
                {
                    name: i18n.t('Evergreen Needleleaf forest'),
                    color: '#162103',
                },
                {
                    name: i18n.t('Evergreen Broadleaf forest'),
                    color: '#235123',
                },
                {
                    name: i18n.t('Deciduous Needleleaf forest'),
                    color: '#399b38',
                },
                {
                    name: i18n.t('Deciduous Broadleaf forest'),
                    color: '#38eb38',
                },
                {
                    name: i18n.t('Mixed forest'),
                    color: '#39723b',
                },
                {
                    name: i18n.t('Closed shrublands'),
                    color: '#6a2424',
                },
                {
                    name: i18n.t('Open shrublands'),
                    color: '#c3a55f',
                },
                {
                    name: i18n.t('Woody savannas'),
                    color: '#b76124',
                },
                {
                    name: i18n.t('Savannas'),
                    color: '#d99125',
                },
                {
                    name: i18n.t('Grasslands'),
                    color: '#92af1f',
                },
                {
                    name: i18n.t('Permanent wetlands'),
                    color: '#10104c',
                },
                {
                    name: i18n.t('Croplands'),
                    color: '#cdb400',
                },
                {
                    name: i18n.t('Urban and built-up'),
                    color: '#cc0202',
                },
                {
                    name: i18n.t('Cropland/Natural vegetation mosaic'),
                    color: '#332808',
                },
                {
                    name: i18n.t('Snow and ice'),
                    color: '#d7cdcc',
                },
                {
                    name: i18n.t('Barren or sparsely vegetated'),
                    color: '#f7e174',
                },
                {
                    name: i18n.t('Water'),
                    color: '#aec3d6',
                },
            ],
        },
        popup: '{name}: {value}',
    },
});

// Returns a promise
const earthEngineLoader = async config => {
    const datasets = getDatasets();
    let layerConfig = {};
    let dataset;

    if (typeof config.config === 'string') {
        // From database as favorite
        layerConfig = JSON.parse(config.config);

        // Backward compability for temperature layer (could also be fixed in a db update script)
        if (layerConfig.id === 'MODIS/MOD11A2' && layerConfig.filter) {
            const period = layerConfig.image.slice(-10);
            layerConfig.id = 'MODIS/006/MOD11A2';
            layerConfig.image = period;
            layerConfig.filter[0].arguments[1] = period;
        }

        dataset = datasets[layerConfig.id];

        if (dataset) {
            dataset.datasetId = layerConfig.id;
            delete layerConfig.id;
        }

        delete config.config;
    } else {
        dataset = datasets[config.datasetId];
    }

    const layer = {
        ...config,
        ...layerConfig,
        ...dataset,
    };

    layer.legend = {
        title: layer.name,
        period: layer.periodName,
        ...layer.legend,
    };

    // Create legend items from params
    if (!layer.legend.items && layer.params) {
        layer.legend.items = createLegend(layer.params);
    }

    return {
        ...layer,
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
    };
};

// TODO: This function is currently duplicated from  GIS API
export const createLegend = params => {
    const min = params.min;
    const max = params.max;
    const palette = params.palette.split(',');
    const step = (params.max - min) / (palette.length - (min > 0 ? 2 : 1));

    let from = min;
    let to = Math.round(min + step);

    return palette.map((color, index) => {
        const item = {
            color: color,
        };

        if (index === 0 && min > 0) {
            // Less than min
            item.name = '< ' + min;
            to = min;
        } else if (from < max) {
            item.name = from + ' - ' + to;
        } else {
            // Higher than max
            item.name = '> ' + from;
        }

        from = to;
        to = Math.round(min + step * (index + (min > 0 ? 1 : 2)));

        return item;
    });
};

export default earthEngineLoader;
