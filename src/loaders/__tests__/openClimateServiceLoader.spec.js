import openClimateServiceLoader from '../openClimateServiceLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

const collection = {
    id: 'chirps3_precipitation_monthly_normal_1991_2020',
    title: 'Precipitation monthly normal',
    description: 'Average CHIRPS rainfall for each calendar month',
    'cube:dimensions': {
        month: { type: 'other', values: [1, 2, 3], step: 1 },
    },
    'cube:variables': { precip: { unit: 'mm/d' } },
    renders: {
        default: {
            rescale: [[0, 20]],
            colormap_name: 'blues',
            'open_climate_service:variable': 'precip',
            nodata: -9999,
        },
    },
    assets: { zarr: { href: 'http://ocs/zarr/normal' } },
}

const engine = (settings) => ({
    query: jest.fn().mockResolvedValue({ settings }),
})

describe('openClimateServiceLoader', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(collection),
        })
    })

    it('loads a saved layer', async () => {
        const result = await openClimateServiceLoader({
            config: {
                id: 'layer1',
                layer: 'openClimateService',
                config: JSON.stringify({
                    datasetId: collection.id,
                    selection: { month: 3 },
                }),
            },
            engine: engine({ url: 'http://ocs/' }),
        })

        expect(global.fetch).toHaveBeenCalledWith(
            'http://ocs/stac/collections/chirps3_precipitation_monthly_normal_1991_2020'
        )
        expect(result.name).toBe('Precipitation monthly normal')
        expect(result.render.selector).toEqual({ month: 2 })
        expect(result.render.fillValue).toBe(-9999)
        expect(result.legend.unit).toBe('mm/d')
        expect(result.legend.items).toHaveLength(7)
        expect(result.isLoaded).toBe(true)
        expect(result.alerts).toBeUndefined()
    })

    it('keeps the saved config, so unset dimensions follow the latest data', async () => {
        const config = { datasetId: collection.id }
        const result = await openClimateServiceLoader({
            config: { id: 'layer1', config },
            engine: engine({ url: 'http://ocs' }),
        })
        expect(result.config).toEqual(config)
        expect(result.render.selector).toEqual({ month: 0 })
    })

    it('uses the default instance when none is linked', async () => {
        const result = await openClimateServiceLoader({
            config: { id: 'layer1', config: { datasetId: collection.id } },
            engine: { query: jest.fn().mockRejectedValue(new Error()) },
        })
        expect(global.fetch).toHaveBeenCalledWith(
            'https://ocs-demo-nepal.dhis2.org/stac/collections/chirps3_precipitation_monthly_normal_1991_2020'
        )
        expect(result.isLoaded).toBe(true)
        expect(result.alerts).toBeUndefined()
    })

    it('loads a vector collection with its published style', async () => {
        const districts = {
            id: 'overture_divisions',
            title: 'Administrative divisions',
            'table:row_count': 15,
            extent: { spatial: { bbox: [[-13.3, 6.9, -10.3, 10.0]] } },
            assets: {
                data: {
                    href: 'http://ocs/features/overture_divisions/data.parquet',
                },
                tiles: {
                    href: 'http://ocs/features/overture_divisions/data.pmtiles',
                },
                style: {
                    href: 'http://ocs/features/overture_divisions/styles/default.json',
                },
            },
        }
        const style = {
            sources: { features: { type: 'vector', url: 'pmtiles://x' } },
            layers: [{ type: 'fill', paint: { 'fill-color': '#0066cc' } }],
        }
        global.fetch = jest.fn((url) =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve(
                        url.endsWith('default.json') ? style : districts
                    ),
            })
        )

        const result = await openClimateServiceLoader({
            config: { id: 'layer1', config: { datasetId: districts.id } },
            engine: engine({ url: 'http://ocs' }),
        })

        expect(global.fetch).toHaveBeenCalledWith(districts.assets.style.href)
        expect(result.render.kind).toBe('vector')
        expect(result.render.style).toEqual(style)
        expect(result.render.bounds).toEqual([
            [-13.3, 6.9],
            [-10.3, 10.0],
        ])
        expect(result.legend.items).toEqual([
            { color: '#0066cc', name: '15 features' },
        ])
        expect(result.alerts).toBeUndefined()
    })
})
