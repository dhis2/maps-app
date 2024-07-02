import { providerDataTransformation } from '../app.js'

jest.mock('../earthEngine.js', () => ({ hasClasses: jest.fn() }))

jest.mock('@dhis2/maps-gl', () => {
    return {
        layerTypes: [
            'vectorStyle',
            'tileLayer',
            'wmsLayer',
            'choropleth',
            'boundary',
            'markers',
            'events',
            'clientCluster',
            'donutCluster',
            'serverCluster',
            'earthEngine',
            'bingLayer',
            'geoJson',
            'group',
        ],
    }
})

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
                mapService: 'VECTOR_STYLE',
                url: 'https://url/to/vectorstyle',
                attribution:
                    '&copy; <a href=\\"http://www.openstreetmap.org/copyright\\">OpenStreetMap</a>, <a href=\\"https://carto.com/attributions\\">CARTO</a>',
                imageFormat: 'PNG',
                mapLayerPosition: 'BASEMAP',
                id: 'LOw2p0kPwua',
                name: 'Vectorstyle basemap',
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
            authorities: ['abc', 'def', 'ghi'],
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
        const userSettings = {
            keyUiLocale: 'en',
        }
        const systemInfo = {
            calendar: 'gregory',
        }

        const cfg = providerDataTransformation({
            currentUser,
            systemSettings,
            externalMapLayers,
            userSettings,
            systemInfo,
        })

        expect(cfg.basemaps).toHaveLength(9)
        expect(cfg.nameProperty).toEqual('displayName')
        expect(cfg.layerTypes).toHaveLength(13)
        expect(cfg.currentUser.username).toEqual('admin')
        expect(cfg.currentUser).toMatchObject({
            id: 'xE7jOejl9FI',
            name: 'John Traore',
            username: 'admin',
            authorities: new Set(['abc', 'def', 'ghi']),
        })
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
            authorities: ['abc', 'def', 'ghi'],
        }
        const systemSettings = {
            keyHideBiMonthlyPeriods: false,
            keyHideBiWeeklyPeriods: false,
            keyHideMonthlyPeriods: false,
            keyAnalysisRelativePeriod: 'LAST_12_MONTHS',
            keyHideDailyPeriods: false,
            keyHideWeeklyPeriods: false,
        }
        const userSettings = {
            keyUiLocale: 'en',
        }
        const systemInfo = {
            calendar: 'gregory',
        }

        const cfg = providerDataTransformation({
            currentUser,
            systemSettings,
            externalMapLayers,
            userSettings,
            systemInfo,
        })

        expect(cfg.basemaps).toHaveLength(5)
        expect(cfg.nameProperty).toEqual('displayShortName')
        expect(cfg.layerTypes).toHaveLength(13)
        expect(cfg.currentUser).toMatchObject({
            id: 'xE7jOejl9FI',
            name: 'John Traore',
            username: 'admin',
            authorities: new Set(['abc', 'def', 'ghi']),
        })
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
