import { cleanMapConfig } from '../favorites.js'

describe('cleanMapConfig', () => {
    test('adds basemap when config basemap is missing id', () => {
        const config = {
            basemap: { isExpanded: true, isVisible: true, opacity: 0.9 },
            latitude: null,
            mapViews: [{ layer: 'layer1' }],
            name: 'my new map',
            zoom: null,
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })
        expect(cleanedConfig).toEqual(
            expect.objectContaining({
                basemap: 'thedefaultBasemap',
                mapViews: [{ layer: 'layer1' }],
                name: 'my new map',
            })
        )

        expect(cleanedConfig).toEqual(
            expect.not.objectContaining({
                zoom: null,
                latitude: null,
            })
        )
    })

    test('returns basemap id from config', () => {
        const config = {
            basemap: {
                id: 'myUniqueBasemap',
                isExpanded: true,
                isVisible: true,
                opacity: 0.9,
            },
            mapViews: [{ layer: 'layer1' }],
            name: 'my new map',
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })
        expect(cleanedConfig).toEqual(
            expect.objectContaining({
                basemap: 'myUniqueBasemap',
                mapViews: [{ layer: 'layer1' }],
                name: 'my new map',
            })
        )
    })

    test('correctly converts earthengine mapview', () => {
        const config = {
            bounds: [
                [-18.7, -34.9],
                [50.2, 35.9],
            ],
            mapViews: [
                {
                    layer: 'earthEngine',
                    layerId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL',
                    datasetId: 'WorldPop/GP/100m/pop_age_sex_cons_unadj',
                    name: 'Population',
                    unit: 'people per hectare',
                    description:
                        'Estimated number of people living in an area.',
                    source: 'WorldPop / Google Earth Engine',
                    sourceUrl:
                        'https://developers.google.com/earth-engine/datasets/catalog/WorldPop_GP_100m_pop_age_sex_cons_unadj',
                    defaultAggregations: ['sum', 'mean'],
                    periodType: 'Yearly',
                    band: 'population',
                    mosaic: true,
                    params: {
                        min: 0,
                        max: 25,
                        palette:
                            '#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15',
                    },
                    opacity: 0.9,
                    aggregationType: ['sum', 'mean'],
                    rows: [
                        {
                            dimension: 'ou',
                            items: [
                                {
                                    id: 'LEVEL-wjP19dkFeIk',
                                    name: 'District',
                                },
                                {
                                    id: 'O6uvpzGd5pu',
                                    path: '/ImspTQPwCqd/O6uvpzGd5pu',
                                    name: 'Bo',
                                },
                            ],
                        },
                    ],
                    areaRadius: 5000,
                    filter: [
                        {
                            id: 'ABW_2020',
                            name: '2020',
                            type: 'eq',
                            arguments: ['year', 2020],
                        },
                    ],
                    editCounter: 1,
                    isLoaded: true,
                    isLoading: false,
                    id: 'eePopLayrId',
                    legend: {
                        title: 'Population Legend',
                    },
                    data: [
                        {
                            type: 'Feature',
                            id: 'O6uvpzGd5pu',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [
                                    [
                                        [-11.5914, 8.4875],
                                        [-11.5906, 8.4769],
                                        [-11.5898, 8.4717],
                                        [-11.5914, 8.4875],
                                    ],
                                ],
                            },
                            properties: {
                                type: 'Polygon',
                                id: 'O6uvpzGd5pu',
                                name: 'Bo',
                                hasCoordinatesDown: true,
                                hasCoordinatesUp: false,
                                level: 2,
                                grandParentParentGraph: '',
                                grandParentId: '',
                                parentGraph: 'ImspTQPwCqd',
                                parentId: 'ImspTQPwCqd',
                                parentName: 'Sierra Leone',
                                dimensions: {},
                            },
                        },
                    ],
                    alerts: [],
                    isExpanded: true,
                    isVisible: true,
                },
            ],
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })

        expect(cleanedConfig).toEqual({
            basemap: 'thedefaultBasemap',
            mapViews: [
                {
                    areaRadius: 5000,
                    config: '{"id":"WorldPop/GP/100m/pop_age_sex_cons_unadj_TOTAL","params":{"min":0,"max":25,"palette":"#fee5d9,#fcbba1,#fc9272,#fb6a4a,#de2d26,#a50f15"},"band":"population","aggregationType":["sum","mean"],"filter":[{"id":"ABW_2020","name":"2020","type":"eq","arguments":["year",2020]}]}',
                    layer: 'earthEngine',
                    name: 'Population',
                    opacity: 0.9,
                    rows: [
                        {
                            dimension: 'ou',
                            items: [
                                {
                                    id: 'LEVEL-wjP19dkFeIk',
                                    name: 'District',
                                },
                                {
                                    id: 'O6uvpzGd5pu',
                                    name: 'Bo',
                                    path: '/ImspTQPwCqd/O6uvpzGd5pu',
                                },
                            ],
                        },
                    ],
                },
            ],
        })
    })

    test('correctly converts geojson mapview', () => {
        const config = {
            bounds: ['bounds'],
            mapViews: [
                {
                    layer: 'geoJsonUrl',
                    name: 'Bo catchment areas',
                    opacity: 1,
                    config: {
                        id: 'CSYRWeK81E7',
                        type: 'geoJson',
                        url: 'https://debug.dhis2.org/analytics-dev/api/routes/aaa11122233/run',
                        name: 'Bo catchment areas',
                        tms: false,
                        format: 'image/png',
                    },
                    featureStyle: {
                        color: 'transparent',
                        strokeColor: '#333333',
                        weight: 1,
                        pointSize: 5,
                    },
                    editCounter: 1,
                    isLoaded: true,
                    isLoading: false,
                    id: 'Z7OGaytEp5a',
                    legend: {
                        title: 'Bo catchment areas',
                        items: [
                            {
                                name: 'Feature',
                                color: '#333333',
                                strokeColor: '#333333',
                                weight: 1,
                                pointSize: 5,
                            },
                        ],
                    },
                    data: [
                        {
                            geometry: {
                                coordinates: [
                                    [
                                        [-11.738399, 7.575499],
                                        [-11.731, 7.5715],
                                    ],
                                ],
                                type: 'Polygon',
                            },
                            id: 1,
                            properties: {
                                'cc:admin:id': ['14'],
                                'cc:oBld:total': 667,
                            },
                            type: 'Feature',
                        },
                    ],
                    isExpanded: true,
                    isVisible: true,
                },
            ],
        }

        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })

        expect(cleanedConfig).toEqual({
            basemap: 'thedefaultBasemap',
            mapViews: [
                {
                    config: '{"id":"CSYRWeK81E7","type":"geoJson","url":"https://debug.dhis2.org/analytics-dev/api/routes/aaa11122233/run","name":"Bo catchment areas","tms":false,"format":"image/png","featureStyle":{"color":"transparent","strokeColor":"#333333","weight":1,"pointSize":5}}',
                    layer: 'geoJsonUrl',
                    name: 'Bo catchment areas',
                    opacity: 1,
                },
            ],
        })
    })

    test('correctly converts TEI mapview', () => {
        const config = {
            bounds: [
                [-18.7, -34.9],
                [50.2, 35.9],
            ],
            mapViews: [
                {
                    layer: 'trackedEntity',
                    type: 'Tracked entities',
                    opacity: 0.5,
                    startDate: '2018-02-19',
                    endDate: '2024-02-19',
                    rows: [
                        {
                            dimension: 'ou',
                            items: [
                                {
                                    path: '/ImspTQPwCqd',
                                    id: 'ImspTQPwCqd',
                                    name: 'Sierra Leone',
                                },
                            ],
                        },
                    ],
                    trackedEntityType: {
                        id: 'Zy2SEgA61ys',
                        name: 'Malaria Entity',
                    },
                    program: null,
                    programStage: null,
                    relationshipType: 'm6XJSapEvOa',
                    relationshipOutsideProgram: null,
                    organisationUnitSelectionMode: 'DESCENDANTS',
                    editCounter: 1,
                    isLoaded: true,
                    isLoading: false,
                    id: 'SyLQwI5u4hD',
                    name: 'Tracked entity',
                    data: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-11.805, 8.3411],
                            },
                            properties: {
                                id: 'RHA9RWNvAnC',
                            },
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [-11.7883, 8.3272],
                            },
                            properties: {
                                id: 'k8TU70vWtnP',
                            },
                        },
                    ],
                    relationships: undefined,
                    secondaryData: undefined,
                    legend: {
                        title: 'Tracked entity',
                        period: 'Feb 19, 2018 - Feb 19, 2024',
                        items: [
                            {
                                name: 'Malaria Entity',
                                color: '#BB0000',
                                radius: 6,
                            },
                            {
                                type: 'LineString',
                                name: 'Index case to cases',
                                color: '#0000BB',
                                weight: 1,
                            },
                            {
                                name: 'Malaria Entity (related)',
                                color: '#000000',
                                radius: 3,
                            },
                        ],
                    },
                    isExpanded: true,
                    isVisible: true,
                },
            ],
        }
        const cleanedConfig = cleanMapConfig({
            config,
            defaultBasemapId: 'thedefaultBasemap',
        })

        expect(cleanedConfig).toEqual({
            basemap: 'thedefaultBasemap',
            mapViews: [
                {
                    startDate: '2018-02-19',
                    endDate: '2024-02-19',
                    layer: 'trackedEntity',
                    name: 'Tracked entity',
                    opacity: 0.5,
                    organisationUnitSelectionMode: 'DESCENDANTS',
                    program: {},
                    programStage: {},
                    rows: [
                        {
                            dimension: 'ou',
                            items: [
                                {
                                    id: 'ImspTQPwCqd',
                                    name: 'Sierra Leone',
                                    path: '/ImspTQPwCqd',
                                },
                            ],
                        },
                    ],
                    trackedEntityType: {
                        id: 'Zy2SEgA61ys',
                        name: 'Malaria Entity',
                    },
                    config: '{"relationships":{"type":"m6XJSapEvOa","relationshipOutsideProgram":null}}',
                },
            ],
        })
    })
})
