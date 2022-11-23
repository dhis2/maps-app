import { createExternalLayer } from '../external'
import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
} from '../../constants/layers.js'

describe('createExternalLayer for basemaps', () => {
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

        expect(createExternalLayer(model)).toMatchObject({
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

        expect(createExternalLayer(model)).toMatchObject({
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

        expect(createExternalLayer(model)).toMatchObject({
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

        expect(createExternalLayer(model)).toMatchObject({
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
