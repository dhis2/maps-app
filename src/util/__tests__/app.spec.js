import { providerDataTransformation } from '../app.js'

jest.mock('../earthEngine.js', () => ({ hasClasses: jest.fn() }))

describe('utils/app', () => {
    const externalMapLayers = {
        externalMapLayers: [
            {
                mapService: 'XYZ',
                url: 'https://a.tiles.mapbox.com/v4/worldbank-education.pebkgmlc/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid29ybGRiYW5rLWVkdWNhdGlvbiIsImEiOiJIZ2VvODFjIn0.TDw5VdwGavwEsch53sAVxA',
                attribution: 'OpenAerialMap / Tanzania Open Data Initiative',
                imageFormat: 'PNG',
                mapLayerPosition: 'BASEMAP',
                id: 'ni2ZiTOZaPD',
                name: 'Aerial imagery of Dar-es-Salaam',
            },
            {
                mapService: 'XYZ',
                url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                attribution:
                    '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
                imageFormat: 'PNG',
                mapLayerPosition: 'BASEMAP',
                id: 'LOw2p0kPwua',
                name: ' Dark basemap',
            },
            {
                mapService: 'XYZ',
                url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png',
                attribution:
                    '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
                imageFormat: 'PNG',
                mapLayerPosition: 'OVERLAY',
                id: 'suB1SFdc6RD',
                name: 'Labels overlay',
            },
            {
                mapService: 'WMS',
                url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
                attribution:
                    '<a href="http://stamen.com">Stamen Design</a>, <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                imageFormat: 'PNG',
                mapLayerPosition: 'BASEMAP',
                id: 'wNIQ8pNvSQd',
                name: 'Terrain basemap',
            },
        ],
    }

    test('providerDataTransformation', () => {
        const currentUser = {
            id: 'xE7jOejl9FI',
            username: 'admin',
            settings: {
                keyAnalysisDisplayProperty: 'name',
            },
            name: 'John Traore',
        }
        const systemSettings = {
            keyHideBiMonthlyPeriods: false,
            keyHideBiWeeklyPeriods: false,
            keyHideMonthlyPeriods: false,
            keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
            keyHideDailyPeriods: false,
            keyBingMapsApiKey: 'bing_maps_api_key',
            keyHideWeeklyPeriods: false,
        }

        const cfg = providerDataTransformation({
            currentUser,
            systemSettings,
            externalMapLayers,
        })

        expect(cfg.basemaps).toHaveLength(11)
        expect(cfg.nameProperty).toEqual('displayName')
        expect(cfg.layerTypes).toHaveLength(13)
        expect(cfg.currentUser.username).toEqual('admin')
        expect(cfg.systemSettings).toMatchObject({
            hiddenPeriods: [],
            keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
            keyBingMapsApiKey: 'bing_maps_api_key',
            keyDefaultBaseMap: 'osmLight',
            keyHideBiMonthlyPeriods: false,
            keyHideBiWeeklyPeriods: false,
            keyHideDailyPeriods: false,
            keyHideMonthlyPeriods: false,
            keyHideWeeklyPeriods: false,
        })
    })

    test('providerDataTransformation no keyBingMapsApiKey', () => {
        const currentUser = {
            id: 'xE7jOejl9FI',
            username: 'admin',
            settings: {
                keyAnalysisDisplayProperty: 'shortName',
            },
            name: 'John Traore',
        }
        const systemSettings = {
            keyHideBiMonthlyPeriods: false,
            keyHideBiWeeklyPeriods: false,
            keyHideMonthlyPeriods: false,
            keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
            keyHideDailyPeriods: false,
            keyHideWeeklyPeriods: false,
        }

        const cfg = providerDataTransformation({
            currentUser,
            systemSettings,
            externalMapLayers,
        })

        expect(cfg.basemaps).toHaveLength(7)
        expect(cfg.nameProperty).toEqual('displayShortName')
        expect(cfg.layerTypes).toHaveLength(13)
        expect(cfg.currentUser.username).toEqual('admin')
        expect(cfg.systemSettings).toMatchObject({
            hiddenPeriods: [],
            keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
            keyDefaultBaseMap: 'osmLight',
            keyHideBiMonthlyPeriods: false,
            keyHideBiWeeklyPeriods: false,
            keyHideDailyPeriods: false,
            keyHideMonthlyPeriods: false,
            keyHideWeeklyPeriods: false,
        })
    })
})

const expectedConfig = {
    basemaps: [
        {
            config: {
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                type: 'tileLayer',
                url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
            },
            id: 'osmLight',
            img: 'images/osmlight.png',
            isDark: false,
            name: 'OSM Light',
        },
        {
            config: {
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                type: 'tileLayer',
                url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            },
            id: 'openStreetMap',
            img: 'images/osm.png',
            isDark: false,
            name: 'OSM Detailed',
        },
        {
            config: {
                style: 'ROADMAP',
                type: 'googleLayer',
            },
            id: 'googleStreets',
            img: 'images/googlestreets.png',
            name: 'Google Streets',
        },
        {
            config: {
                style: 'HYBRID',
                type: 'googleLayer',
            },
            id: 'googleHybrid',
            img: 'images/googlehybrid.jpeg',
            name: 'Google Hybrid',
        },
        {
            config: {
                apiKey: 'bing_maps_api_key',
                style: 'CanvasLight',
                type: 'bingLayer',
            },
            id: 'bingLight',
            img: 'images/bingroad.png',
            isDark: false,
            name: 'Bing Road',
        },
        {
            config: {
                apiKey: 'bing_maps_api_key',
                style: 'CanvasDark',
                type: 'bingLayer',
            },
            id: 'bingDark',
            img: 'images/bingdark.png',
            isDark: true,
            name: 'Bing Dark',
        },
        {
            config: {
                apiKey: 'bing_maps_api_key',
                style: 'Aerial',
                type: 'bingLayer',
            },
            id: 'bingAerial',
            img: 'images/bingaerial.jpeg',
            isDark: true,
            name: 'Bing Aerial',
        },
        {
            config: {
                apiKey: 'bing_maps_api_key',
                style: 'AerialWithLabelsOnDemand',
                type: 'bingLayer',
            },
            id: 'bingHybrid',
            img: 'images/binghybrid.jpeg',
            isDark: true,
            name: 'Bing Aerial Labels',
        },
        {
            config: {
                attribution: 'OpenAerialMap / Tanzania Open Data Initiative',
                format: 'image/png',
                id: 'ni2ZiTOZaPD',
                layers: undefined,
                legendSet: undefined,
                legendSetUrl: undefined,
                name: 'Aerial imagery of Dar-es-Salaam',
                tms: false,
                type: 'tileLayer',
                url: 'https://a.tiles.mapbox.com/v4/worldbank-education.pebkgmlc/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid29ybGRiYW5rLWVkdWNhdGlvbiIsImEiOiJIZ2VvODFjIn0.TDw5VdwGavwEsch53sAVxA',
            },
            id: 'ni2ZiTOZaPD',
            layer: 'external',
            name: 'Aerial imagery of Dar-es-Salaam',
            opacity: 1,
        },
        {
            config: {
                attribution:
                    '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
                format: 'image/png',
                id: 'LOw2p0kPwua',
                layers: undefined,
                legendSet: undefined,
                legendSetUrl: undefined,
                name: ' Dark basemap',
                tms: false,
                type: 'tileLayer',
                url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
            },
            id: 'LOw2p0kPwua',
            layer: 'external',
            name: ' Dark basemap',
            opacity: 1,
        },
        {
            config: {
                attribution:
                    '<a href="http://stamen.com">Stamen Design</a>, <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                format: 'image/png',
                id: 'wNIQ8pNvSQd',
                layers: undefined,
                legendSet: undefined,
                legendSetUrl: undefined,
                name: 'Terrain basemap',
                tms: false,
                type: 'wmsLayer',
                url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
            },
            id: 'wNIQ8pNvSQd',
            layer: 'external',
            name: 'Terrain basemap',
            opacity: 1,
        },
    ],
    currentUser: {
        id: 'xE7jOejl9FI',
        name: 'John Traore',
        username: 'admin',
    },
    layerTypes: [
        {
            img: 'images/thematic.png',
            layer: 'thematic',
            opacity: 0.9,
            type: 'Thematic',
        },
        {
            eventClustering: true,
            img: 'images/events.png',
            layer: 'event',
            opacity: 0.8,
            type: 'Events',
        },
        {
            img: 'images/trackedentities.png',
            layer: 'trackedEntity',
            opacity: 0.5,
            type: 'Tracked entities',
        },
        {
            img: 'images/facilities.png',
            layer: 'facility',
            opacity: 1,
            type: 'Facilities',
        },
        {
            img: 'images/orgunits.png',
            layer: 'orgUnit',
            opacity: 1,
            type: 'Org units',
        },
        {
            band: 'population',
            datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
            defaultAggregations: ['sum', 'mean'],
            description: 'Estimated number of people living in an area.',
            filters: () => {},
            img: 'images/population.png',
            layer: 'earthEngine',
            layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL',
            mosaic: true,
            name: 'Population',
            opacity: 0.9,
            params: {
                max: 25,
                min: 0,
                palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15',
            },
            periodType: 'Yearly',
            source: 'WorldPop / Google Earth Engine',
            sourceUrl:
                'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
            unit: 'people per hectare',
        },
        {
            bands: [
                {
                    id: 'M_0',
                    name: 'Male 0 - 1 years',
                },
                {
                    id: 'M_1',
                    name: 'Male 1 - 4 years',
                },
                {
                    id: 'M_5',
                    name: 'Male 5 - 9 years',
                },
                {
                    id: 'M_10',
                    name: 'Male 10 - 14 years',
                },
                {
                    id: 'M_15',
                    name: 'Male 15 - 19 years',
                },
                {
                    id: 'M_20',
                    name: 'Male 20 - 24 years',
                },
                {
                    id: 'M_25',
                    name: 'Male 25 - 29 years',
                },
                {
                    id: 'M_30',
                    name: 'Male 30 - 34 years',
                },
                {
                    id: 'M_35',
                    name: 'Male 35 - 39 years',
                },
                {
                    id: 'M_40',
                    name: 'Male 40 - 44 years',
                },
                {
                    id: 'M_45',
                    name: 'Male 45 - 49 years',
                },
                {
                    id: 'M_50',
                    name: 'Male 50 - 54 years',
                },
                {
                    id: 'M_55',
                    name: 'Male 55 - 59 years',
                },
                {
                    id: 'M_60',
                    name: 'Male 60 - 64 years',
                },
                {
                    id: 'M_65',
                    name: 'Male 65 - 69 years',
                },
                {
                    id: 'M_70',
                    name: 'Male 70 - 74 years',
                },
                {
                    id: 'M_75',
                    name: 'Male 75 - 79 years',
                },
                {
                    id: 'M_80',
                    name: 'Male 80 years and above',
                },
                {
                    id: 'F_0',
                    name: 'Female 0 - 1 years',
                },
                {
                    id: 'F_1',
                    name: 'Female 1 - 4 years',
                },
                {
                    id: 'F_5',
                    name: 'Female 5 - 9 years',
                },
                {
                    id: 'F_10',
                    name: 'Female 10 - 14 years',
                },
                {
                    id: 'F_15',
                    name: 'Female 15 - 19 years',
                },
                {
                    id: 'F_20',
                    name: 'Female 20 - 24 years',
                },
                {
                    id: 'F_25',
                    name: 'Female 25 - 29 years',
                },
                {
                    id: 'F_30',
                    name: 'Female 30 - 34 years',
                },
                {
                    id: 'F_35',
                    name: 'Female 35 - 39 years',
                },
                {
                    id: 'F_40',
                    name: 'Female 40 - 44 years',
                },
                {
                    id: 'F_45',
                    name: 'Female 45 - 49 years',
                },
                {
                    id: 'F_50',
                    name: 'Female 50 - 54 years',
                },
                {
                    id: 'F_55',
                    name: 'Female 55 - 59 years',
                },
                {
                    id: 'F_60',
                    name: 'Female 60 - 64 years',
                },
                {
                    id: 'F_65',
                    name: 'Female 65 - 69 years',
                },
                {
                    id: 'F_70',
                    multiple: true,
                    name: 'Female 70 - 74 years',
                },
                {
                    id: 'F_75',
                    name: 'Female 75 - 79 years',
                },
                {
                    id: 'F_80',
                    name: 'Female 80 years and above',
                },
            ],
            datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
            defaultAggregations: ['sum', 'mean'],
            description:
                'Estimated number of people living in an area, grouped by age and gender.',
            filters: () => {},
            img: 'images/population.png',
            layer: 'earthEngine',
            layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
            mosaic: true,
            name: 'Population age groups',
            opacity: 0.9,
            params: {
                max: 10,
                min: 0,
                palette: '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15',
            },
            periodType: 'Yearly',
            source: 'WorldPop / Google Earth Engine',
            sourceUrl:
                'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
            tileScale: 4,
            unit: 'people per hectare',
        },
        {
            aggregations: ['count'],
            datasetId: 'GOOGLE/Research/open-buildings/v1/polygons',
            defaultAggregations: ['count'],
            description:
                'The outlines of buildings derived from high-resolution satellite imagery. Only for the continent of Africa.',
            error: 'Select a smaller area or single organization unit to see the count of buildings.',
            format: 'FeatureCollection',
            img: 'images/buildings.png',
            layer: 'earthEngine',
            layerId: 'GOOGLE/Research/open-buildings/v1/polygons',
            name: 'Building footprints',
            notice: 'Building counts are only available for smaller organisation unit areas.',
            opacity: 0.9,
            source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
            sourceUrl: 'https://sites.research.google/open-buildings/',
            unit: 'Number of buildings',
        },
        {
            aggregations: [
                'min',
                'max',
                'mean',
                'median',
                'stdDev',
                'variance',
            ],
            band: 'elevation',
            datasetId: 'USGS/SRTMGL1_003',
            defaultAggregations: ['mean', 'min', 'max'],
            description: 'Elevation above sea-level.',
            img: 'images/elevation.png',
            layer: 'earthEngine',
            layerId: 'USGS/SRTMGL1_003',
            name: 'Elevation',
            opacity: 0.9,
            params: {
                max: 1500,
                min: 0,
                palette: '#ffffd4,#fee391,#fec44f,#fe9929,#d95f0e,#993404',
            },
            source: 'NASA / USGS / JPL-Caltech / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/USGS%2FSRTMGL1_003',
            unit: 'meters',
        },
        {
            aggregations: [
                'min',
                'max',
                'mean',
                'median',
                'stdDev',
                'variance',
            ],
            band: 'precipitation',
            datasetId: 'UCSB-CHG/CHIRPS/PENTAD',
            defaultAggregations: ['mean', 'min', 'max'],
            description:
                'Precipitation collected from satellite and weather stations on the ground. The values are in millimeters within 5 days periods. Updated monthly, during the 3rd week of the following month.',
            img: 'images/precipitation.png',
            layer: 'earthEngine',
            layerId: 'UCSB-CHG/CHIRPS/PENTAD',
            mask: true,
            name: 'Precipitation',
            opacity: 0.9,
            params: {
                max: 100,
                min: 0,
                palette: '#eff3ff,#c6dbef,#9ecae1,#6baed6,#3182bd,#08519c',
            },
            periodType: 'Custom',
            source: 'UCSB / CHG / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/UCSB-CHG%2FCHIRPS%2FPENTAD',
            unit: 'millimeter',
        },
        {
            aggregations: [
                'min',
                'max',
                'mean',
                'median',
                'stdDev',
                'variance',
            ],
            band: 'LST_Day_1km',
            datasetId: 'MODIS/006/MOD11A2',
            defaultAggregations: ['mean', 'min', 'max'],
            description:
                'Land surface temperatures collected from satellite. Blank spots will appear in areas with a persistent cloud cover.',
            img: 'images/temperature.png',
            layer: 'earthEngine',
            layerId: 'MODIS/006/MOD11A2',
            mask: true,
            methods: {
                multiply: [0.02],
                subtract: [273.15],
                toFloat: [],
            },
            name: 'Temperature',
            opacity: 0.9,
            params: {
                max: 40,
                min: 0,
                palette:
                    '#fff5f0,#fee0d2,#fcbba1,#fc9272,#fb6a4a,#ef3b2c,#cb181d,#a50f15,#67000d',
            },
            periodType: 'Custom',
            source: 'NASA LP DAAC / Google Earth Engine',
            sourceUrl:
                'https://explorer.earthengine.google.com/#detail/MODIS%2FMOD11A2',
            unit: '°C during daytime',
        },
        {
            band: 'LC_Type1',
            datasetId: 'MODIS/061/MCD12Q1',
            defaultAggregations: 'percentage',
            description: 'Distinct landcover types collected from satellites.',
            filters: undefined,
            img: 'images/landcover.png',
            layer: 'earthEngine',
            layerId: 'MODIS/006/MCD12Q1',
            legend: {
                items: [
                    {
                        color: '#162103',
                        id: 1,
                        name: 'Evergreen Needleleaf forest',
                    },
                    {
                        color: '#235123',
                        id: 2,
                        name: 'Evergreen Broadleaf forest',
                    },
                    {
                        color: '#399b38',
                        id: 3,
                        name: 'Deciduous Needleleaf forest',
                    },
                    {
                        color: '#38eb38',
                        id: 4,
                        name: 'Deciduous Broadleaf forest',
                    },
                    {
                        color: '#39723b',
                        id: 5,
                        name: 'Mixed forest',
                    },
                    {
                        color: '#6a2424',
                        id: 6,
                        name: 'Closed shrublands',
                    },
                    {
                        color: '#c3a55f',
                        id: 7,
                        name: 'Open shrublands',
                    },
                    {
                        color: '#b76124',
                        id: 8,
                        name: 'Woody savannas',
                    },
                    {
                        color: '#d99125',
                        id: 9,
                        name: 'Savannas',
                    },
                    {
                        color: '#92af1f',
                        id: 10,
                        name: 'Grasslands',
                    },
                    {
                        color: '#10104c',
                        id: 11,
                        name: 'Permanent wetlands',
                    },
                    {
                        color: '#cdb400',
                        id: 12,
                        name: 'Croplands',
                    },
                    {
                        color: '#cc0202',
                        id: 13,
                        name: 'Urban and built-up',
                    },
                    {
                        color: '#332808',
                        id: 14,
                        name: 'Cropland/Natural vegetation mosaic',
                    },
                    {
                        color: '#d7cdcc',
                        id: 15,
                        name: 'Snow and ice',
                    },
                    {
                        color: '#f7e174',
                        id: 16,
                        name: 'Barren or sparsely vegetated',
                    },
                    {
                        color: '#aec3d6',
                        id: 17,
                        name: 'Water',
                    },
                ],
            },
            mask: false,
            name: 'Landcover',
            opacity: 0.9,
            periodType: 'Yearly',
            popup: '{name}: {value}',
            source: 'NASA LP DAAC / Google Earth Engine',
            sourceUrl:
                'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MCD12Q1',
        },
        {
            config: {
                attribution:
                    '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
                format: 'image/png',
                id: 'suB1SFdc6RD',
                layers: undefined,
                legendSet: undefined,
                legendSetUrl: undefined,
                name: 'Labels overlay',
                tms: false,
                type: 'tileLayer',
                url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png',
            },
            id: 'suB1SFdc6RD',
            layer: 'external',
            name: 'Labels overlay',
            opacity: 1,
        },
    ],
    nameProperty: 'displayName',
    systemSettings: {
        hiddenPeriods: [],
        keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
        keyBingMapsApiKey: 'bing_maps_api_key',
        keyDefaultBaseMap: 'osmLight',
        keyHideBiMonthlyPeriods: false,
        keyHideBiWeeklyPeriods: false,
        keyHideDailyPeriods: false,
        keyHideMonthlyPeriods: false,
        keyHideWeeklyPeriods: false,
    },
}
