import { getFallbackBasemap } from '../../constants/basemaps.js'
import {
    AZURE_LAYER,
    BING_LAYER,
    KEYS_VALIDATION,
    MAP_LAYER_POSITION_BASEMAP,
} from '../../constants/layers.js'
import {
    validateKeys,
    getBasemapList,
    getBasemapOrFallback,
} from '../basemaps.js'

const findValidationByType = (type) => {
    for (const validations of Object.values(KEYS_VALIDATION)) {
        const match = validations.find((v) => v.type === type)
        if (match) {
            return match
        }
    }
    return null
}

global.fetch = jest.fn()

jest.mock('@dhis2/maps-gl', () => ({}))

jest.mock('../../constants/basemaps.js', () => ({
    getFallbackBasemap: jest.fn(() => ({ id: 'fallback', name: 'Fallback' })),
    defaultBasemaps: jest.fn(() => [
        {
            id: 'azureLayerId',
            config: { type: 'azureLayer' },
        },
        {
            id: 'bingLayerId',
            config: { type: 'bingLayer' },
        },
    ]),
}))

jest.mock('../../components/map/MapApi', () => ({
    layerTypes: ['azureLayer', 'bingLayer'],
}))

describe('utils/basemaps - validateKeys', () => {
    beforeAll(() => {
        fetch.mockReset()
    })

    test('validateKeys returns correct status - AZURE_LAYER 1', async () => {
        const systemSettings = {
            keyBingMapsApiKey: 'azure_maps_api_key',
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(AZURE_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: 'azure_maps_api_key',
            [BING_LAYER]: false,
        })
    })

    test('validateKeys returns correct status - AZURE_LAYER 2', async () => {
        const systemSettings = {
            keyAzureMapsApiKey: 'azure_maps_api_key',
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(AZURE_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: 'azure_maps_api_key',
            [BING_LAYER]: false,
        })
    })

    test('validateKeys returns correct status - BING_LAYER', async () => {
        const systemSettings = {
            keyBingMapsApiKey: 'bing_maps_api_key',
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(BING_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: false,
            [BING_LAYER]: 'bing_maps_api_key',
        })
    })

    test('validateKeys returns correct status - invalid key', async () => {
        const systemSettings = {
            keyBingMapsApiKey: 'invalid_api_key',
        }
        global.fetch = jest.fn(() => Promise.resolve({ ok: false }))

        const keysStatus = await validateKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: false,
            [BING_LAYER]: false,
        })
    })

    test('validateKeys returns correct status - missing key', async () => {
        const systemSettings = {}

        const keysStatus = await validateKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: false,
            [BING_LAYER]: false,
        })
    })
})

describe('utils/basemaps - getBasemapOrFallback', () => {
    const basemaps = [
        { id: 'one', name: 'One' },
        { id: 'two', name: 'Two' },
    ]

    it('returns the basemap matching the provided id', () => {
        const result = getBasemapOrFallback({ basemaps, id: 'one' })
        expect(result).toEqual({ id: 'one', name: 'One' })
    })

    it('returns the basemap matching the defaultId if id is not found', () => {
        const result = getBasemapOrFallback({
            basemaps,
            id: 'missing',
            defaultId: 'two',
        })
        expect(result).toEqual({ id: 'two', name: 'Two' })
    })

    it('returns getFallbackBasemap if neither id nor defaultId are found', () => {
        const result = getBasemapOrFallback({
            basemaps,
            id: 'missing',
            defaultId: 'also-missing',
        })
        expect(result).toEqual({ id: 'fallback', name: 'Fallback' })
        expect(getFallbackBasemap).toHaveBeenCalled()
    })

    it('calls onMissing with correct message when id is not found', () => {
        const onMissing = jest.fn()
        getBasemapOrFallback({
            basemaps,
            id: 'missing',
            defaultId: 'two',
            onMissing,
        })
        expect(onMissing).toHaveBeenCalledWith(
            expect.stringContaining('Could not load: missing')
        )
    })
})

describe.skip('utils/basemaps - getBasemapList', () => {
    const mockValidateKeys = jest.spyOn(
        require('../basemaps.js'),
        'validateKeys'
    )

    it('returns default basemaps matching supported layer types, with apiKeys if present', async () => {
        mockValidateKeys.mockResolvedValue({
            azureLayer: 'apikey',
            bingLayer: false,
        })

        const externalMapLayers = []

        const result = await getBasemapList({
            externalMapLayers,
            systemSettings: {},
        })

        expect(result).toEqual([
            {
                id: 'default1',
                config: { type: 'DEFAULT_TYPE', apiKey: 'apikey' },
            },
        ])
    })

    it('includes external basemaps matching supported map services', async () => {
        mockValidateKeys.mockResolvedValue({ DEFAULT_TYPE: 'apikey' })

        const externalMapLayers = [
            {
                id: 'ext1',
                name: 'External 1',
                mapLayerPosition: MAP_LAYER_POSITION_BASEMAP,
                mapService: 'TMS',
                config: { type: 'DEFAULT_TYPE' },
            },
            {
                id: 'ext2',
                name: 'External 2',
                mapLayerPosition: 'OVERLAY',
                mapService: 'TMS',
            },
        ]

        const result = await getBasemapList({
            externalMapLayers,
            systemSettings: {},
        })

        expect(result.some((b) => b.id === 'ext1')).toBe(true)
        expect(result.some((b) => b.id === 'ext2')).toBe(false)
    })

    it('excludes default basemaps if keysStatus[type] is falsy', async () => {
        mockValidateKeys.mockResolvedValue({ DEFAULT_TYPE: false })

        const result = await getBasemapList({
            externalMapLayers: [],
            systemSettings: {},
        })

        expect(result).toEqual([])
    })
})
