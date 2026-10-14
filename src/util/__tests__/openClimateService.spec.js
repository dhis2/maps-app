import {
    formatStep,
    getColormap,
    getDefaultSelection,
    getDimensions,
    getRenderOptions,
    getSelectionIndexes,
    getVectorColor,
    getVectorOptions,
    isRasterCollection,
    isVectorCollection,
    normalizeUrl,
} from '../openClimateService.js'

const collection = {
    id: 'era5land_temperature_monthly',
    extent: { spatial: { bbox: [[80.1, 26.4, 88.2, 30.4]] } },
    'proj:code': 'OGC:CRS84',
    'cube:dimensions': {
        t: {
            type: 'temporal',
            extent: ['2025-11-01T00:00:00Z', '2026-02-01T00:00:00Z'],
            step: 'P1M',
        },
        x: { type: 'spatial', axis: 'x', extent: [80.1, 88.2] },
        y: { type: 'spatial', axis: 'y', extent: [26.4, 30.4] },
    },
    'cube:variables': { t2m: { unit: 'degC' } },
    renders: {
        default: {
            rescale: [[-30, 30]],
            colormap_name: 'rdbu_r',
            'open_climate_service:variable': 't2m',
        },
    },
    assets: {
        zarr: {
            href: 'http://ocs/zarr/era5land_temperature_monthly',
            'zarr:zarr_format': 3,
        },
    },
}

const normal = {
    'cube:dimensions': {
        month: { type: 'other', values: [1, 2, 3], step: 1 },
    },
}

describe('openClimateService', () => {
    it('expands a temporal dimension into steps', () => {
        expect(getDimensions(collection)).toEqual([
            {
                key: 't',
                isTemporal: true,
                step: 'P1M',
                steps: ['2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01'],
            },
        ])
    })

    it.each([
        ['P7D', ['2026-01-01', '2026-01-08', '2026-01-15']],
        ['P1Y', ['2026-01-01']],
        ['PT6H', ['2026-01-01T00:00', '2026-01-01T06:00', '2026-01-01T12:00']],
        ['P1X', []],
        ['P', []],
    ])('expands the duration %s', (step, expected) => {
        const [dim] = getDimensions({
            'cube:dimensions': {
                t: {
                    type: 'temporal',
                    extent: [
                        '2026-01-01T00:00:00Z',
                        step === 'PT6H'
                            ? '2026-01-01T12:00:00Z'
                            : '2026-01-15T00:00:00Z',
                    ],
                    step,
                },
            },
        })
        expect(dim?.steps || []).toEqual(expected)
    })

    it('trims trailing slashes from a url', () => {
        expect(normalizeUrl(' http://ocs/api// ')).toBe('http://ocs/api')
    })

    it('keeps the values of a non-temporal dimension', () => {
        const [month] = getDimensions(normal)
        expect(month.key).toBe('month')
        expect(month.steps).toEqual([1, 2, 3])
    })

    it('defaults to the latest time step and the first other value', () => {
        const dimensions = [
            ...getDimensions(collection),
            ...getDimensions(normal),
        ]
        expect(getDefaultSelection(dimensions)).toEqual({
            t: '2026-02-01',
            month: 1,
        })
    })

    it('resolves saved values to indexes', () => {
        const dimensions = [
            ...getDimensions(collection),
            ...getDimensions(normal),
        ]
        expect(
            getSelectionIndexes(dimensions, { t: '2025-12-01', month: 3 })
        ).toEqual({ t: 1, month: 2 })
    })

    it('falls back to the default when a saved value is gone', () => {
        const dimensions = getDimensions(collection)
        expect(getSelectionIndexes(dimensions, { t: '1990-01-01' })).toEqual({
            t: 3,
        })
    })

    it('formats steps by cadence', () => {
        const [time] = getDimensions(collection)
        expect(formatStep('2026-01-01', time)).toMatch(/2026/)
        expect(formatStep('2026-01-01', { ...time, step: 'P1Y' })).toBe('2026')
        expect(formatStep('2026-01-05', { ...time, step: 'P1D' })).toBe(
            '2026-01-05'
        )
        expect(formatStep(5, { key: 'band', isTemporal: false, step: 1 })).toBe(
            '5'
        )
    })

    it('builds render options from the render hints', () => {
        expect(getRenderOptions(collection)).toEqual({
            kind: 'raster',
            source: 'http://ocs/zarr/era5land_temperature_monthly',
            variable: 't2m',
            min: -30,
            max: 30,
            colormapName: 'rdbu_r',
            fillValue: null,
            zarrVersion: 3,
            crs: 'EPSG:4326',
            proj4: null,
            unit: 'degC',
            bounds: [
                [80.1, 26.4],
                [88.2, 30.4],
            ],
        })
    })

    it('reverses a colormap with the _r suffix', () => {
        expect(getColormap('rdbu_r', 5)).toEqual(
            [...getColormap('rdbu', 5)].reverse()
        )
    })

    it('tells raster and vector collections apart by their assets', () => {
        const vector = {
            assets: {
                tiles: { href: 'http://ocs/features/d/data.pmtiles' },
                style: { href: 'http://ocs/features/d/styles/default.json' },
            },
        }
        expect(isRasterCollection(collection)).toBe(true)
        expect(isVectorCollection(collection)).toBe(false)
        expect(isVectorCollection(vector)).toBe(true)
        expect(isRasterCollection(vector)).toBe(false)
        // Without tiles a vector collection cannot be drawn
        expect(isVectorCollection({ assets: { data: { href: 'x' } } })).toBe(
            false
        )
    })

    it('draws a vector collection with its published style', () => {
        const style = {
            sources: { features: { type: 'vector' } },
            layers: [
                { type: 'line', paint: { 'line-color': '#1e3a5f' } },
                { type: 'fill', paint: { 'fill-color': '#0066cc' } },
            ],
        }
        const vector = { ...collection, 'table:row_count': 15 }

        expect(getVectorOptions(vector, style)).toEqual({
            kind: 'vector',
            style,
            bounds: [
                [80.1, 26.4],
                [88.2, 30.4],
            ],
            featureCount: 15,
        })
        expect(getVectorColor(style)).toBe('#0066cc')
        expect(getVectorColor({ layers: [] })).toBe('#0066cc')
    })
})
