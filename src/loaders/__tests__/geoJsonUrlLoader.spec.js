import { getOsmDataUrl } from '../../components/osmImport/osmLayer.js'
import geoJsonUrlLoader from '../geoJsonUrlLoader.js'

jest.mock('../../components/osmImport/osmLayer.js', () => ({
    ...jest.requireActual('../../components/osmImport/osmLayer.js'),
    getOsmDataUrl: jest.fn(),
}))

const toDataUrl = (geojson) =>
    `data:application/geo+json,${encodeURIComponent(JSON.stringify(geojson))}`

const pharmacy = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-13.2, 8.4] },
    properties: { id: 'ev1', name: 'Pharmacy', tag: 'amenity=pharmacy' },
}

const osmConfig = {
    name: 'OSM Health facilities, Western Area',
    osmProgram: 'duL5mvaOFgU',
    osmOrgUnits: ['at6UHUQatSo'],
}

// Reads the GeoJSON of a data URL, as the browser does
global.fetch = jest.fn(async (url) => ({
    ok: true,
    json: async () => JSON.parse(decodeURIComponent(url.split(',')[1])),
}))

describe('geoJsonUrlLoader', () => {
    beforeEach(() => {
        getOsmDataUrl.mockResolvedValue({
            count: 1,
            url: toDataUrl({ type: 'FeatureCollection', features: [pharmacy] }),
        })
    })

    afterEach(() => jest.clearAllMocks())

    it('loads the current events of a saved OSM layer', async () => {
        const engine = {}
        const layer = await geoJsonUrlLoader({
            config: {
                layer: 'geoJsonUrl',
                config: JSON.stringify({
                    ...osmConfig,
                    featureStyle: { color: '#1b9e77', pointSize: 6 },
                }),
            },
            engine,
            baseUrl: 'https://dhis2.example.org',
        })

        expect(getOsmDataUrl).toHaveBeenCalledWith(engine, 'duL5mvaOFgU', [
            'at6UHUQatSo',
        ])
        expect(layer.loadError).toBeUndefined()
        expect(layer.data).toHaveLength(1)
        expect(layer.legend.items).toEqual([
            { name: 'Pharmacies', image: 'images/osm/pharmacies.png' },
        ])
    })

    it('uses the features of an OSM layer added in the app', async () => {
        const layer = await geoJsonUrlLoader({
            config: {
                layer: 'geoJsonUrl',
                config: {
                    ...osmConfig,
                    url: toDataUrl({
                        type: 'FeatureCollection',
                        features: [pharmacy, pharmacy],
                    }),
                },
                featureStyle: { color: '#1b9e77', pointSize: 6 },
            },
            engine: {},
            baseUrl: 'https://dhis2.example.org',
        })

        expect(getOsmDataUrl).not.toHaveBeenCalled()
        expect(layer.data).toHaveLength(2)
    })
})
