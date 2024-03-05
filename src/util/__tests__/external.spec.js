import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
    GEOJSON_URL_LAYER,
    GEOJSON_LAYER,
} from '../../constants/layers.js'
import {
    createExternalBasemapLayer,
    createExternalOverlayLayer,
} from '../external.js'

describe('createExternalBasemapLayer', () => {
    test('Vector Style', () => {
        const id = 'myvector-style-basemap'
        const name = 'Vector style external basemap'
        const url = 'https://path-to-style/style.json'
        const model = {
            id,
            name,
            url,
            mapService: 'VECTOR_STYLE',
            imageFormat: 'PNG',
            mapLayerPosition: 'BASEMAP',
        }

        expect(createExternalBasemapLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            id,
            name,
            opacity: 1,
            config: {
                id,
                type: VECTOR_STYLE,
                url,
                name,
                tms: false,
                format: 'image/png',
            },
        })
    })

    test('XYZ', () => {
        const id = 'my-xyz-basemap'
        const name = 'My XYZ basemap'
        const url = 'https://path-to-xyz'
        const model = {
            id,
            name,
            url,
            mapService: 'XYZ',
            imageFormat: 'PNG',
            mapLayerPosition: 'BASEMAP',
        }

        expect(createExternalBasemapLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            id,
            name,
            opacity: 1,
            config: {
                id,
                type: TILE_LAYER,
                url,
                name,
                tms: false,
                format: 'image/png',
            },
        })
    })

    test('TMS', () => {
        const id = 'my-tms-basemap'
        const name = 'My TMS basemap'
        const url = 'https://path-to-tms'
        const model = {
            id,
            name,
            url,
            mapService: 'TMS',
            imageFormat: 'JPG',
            mapLayerPosition: 'BASEMAP',
        }

        expect(createExternalBasemapLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            id,
            name,
            opacity: 1,
            config: {
                id,
                type: TILE_LAYER,
                url,
                name,
                tms: true,
                format: 'image/jpeg',
            },
        })
    })

    test('WMS with legend set', () => {
        const id = 'wms-with-legendset'
        const name = 'WMS with legend set'
        const url = 'https://path-to-wms'
        const attribution =
            '<a href="http://wms.com">Rainbow design</a>, <a href="someurl">Rainbow</a>'
        const legendSet = {
            id: 'legend-set-id',
        }
        const model = {
            id,
            name,
            url,
            mapService: 'WMS',
            imageFormat: 'PNG',
            mapLayerPosition: 'BASEMAP',
            attribution,
            legendSet,
        }

        expect(createExternalBasemapLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            id,
            name,
            opacity: 1,
            config: {
                id,
                type: WMS_LAYER,
                url,
                name,
                tms: false,
                format: 'image/png',
                legendSet,
            },
        })
    })
})

describe('createExternalOverlayLayer', () => {
    test('XYZ', () => {
        const id = 'my-xyz-overlay'
        const name = 'My XYZ overlay'
        const url = 'https://path-to-xyz'
        const model = {
            id,
            name,
            url,
            mapService: 'XYZ',
            imageFormat: 'PNG',
            mapLayerPosition: 'OVERLAY',
        }

        expect(createExternalOverlayLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            name,
            opacity: 1,
            img: 'images/featurelayer.png',
            config: {
                id,
                type: TILE_LAYER,
                url,
                name,
                tms: false,
                format: 'image/png',
            },
        })
    })

    test('TMS', () => {
        const id = 'my-tms-overlay'
        const name = 'My TMS overlay'
        const url = 'https://path-to-tms'
        const model = {
            id,
            name,
            url,
            mapService: 'TMS',
            imageFormat: 'JPG',
            mapLayerPosition: 'BASEMAP',
        }

        expect(createExternalOverlayLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            name,
            opacity: 1,
            img: 'images/featurelayer.png',
            config: {
                id,
                type: TILE_LAYER,
                url,
                name,
                tms: true,
                format: 'image/jpeg',
            },
        })
    })

    test('WMS with legend set', () => {
        const id = 'wms-with-legendset'
        const name = 'WMS with legend set'
        const url = 'https://path-to-wms'
        const attribution =
            '<a href="http://wms.com">Rainbow design</a>, <a href="someurl">Rainbow</a>'
        const legendSet = {
            id: 'legend-set-id',
        }
        const model = {
            id,
            name,
            url,
            mapService: 'WMS',
            imageFormat: 'PNG',
            mapLayerPosition: 'OVERLAY',
            attribution,
            legendSet,
        }

        expect(createExternalOverlayLayer(model)).toMatchObject({
            layer: EXTERNAL_LAYER,
            name,
            opacity: 1,
            img: 'images/featurelayer.png',
            config: {
                id,
                type: WMS_LAYER,
                url,
                name,
                tms: false,
                format: 'image/png',
                legendSet,
            },
        })
    })

    test('GEOJSON_URL', () => {
        const id = 'my-geojson-url-overlay'
        const name = 'My Geojson url overlay'
        const url = 'https://path-to-geojson'
        const model = {
            id,
            name,
            url,
            mapService: 'GEOJSON_URL',
            imageFormat: 'JPG',
            mapLayerPosition: 'OVERLAY',
        }

        expect(createExternalOverlayLayer(model)).toMatchObject({
            layer: GEOJSON_URL_LAYER,
            name,
            opacity: 1,
            img: 'images/featurelayer.png',
            config: {
                id,
                type: GEOJSON_LAYER,
                url,
                name,
                tms: false,
                format: 'image/jpeg',
            },
        })
    })
})
