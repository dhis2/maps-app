import { getFallbackBasemap } from '../../constants/basemaps.js'
import {
    AZURE_LAYER,
    BING_LAYER,
    MAP_SERVICE_KEY_TESTS,
    MAP_LAYER_POSITION_BASEMAP,
    MAP_LAYER_POSITION_OVERLAY,
} from '../../constants/layers.js'
import {
    validateMapServiceKeys,
    getBasemapList,
    getBasemapOrFallback,
} from '../basemaps.js'

const AZURE_LAYER_KEY = 'azure_maps_api_key'
const BING_LAYER_KEY = 'bing_maps_api_key'

const findValidationByType = (type) => {
    for (const validations of Object.values(MAP_SERVICE_KEY_TESTS)) {
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
    layerTypes: ['azureLayer', 'bingLayer', 'tileLayer'],
}))

describe('utils/basemaps - validateMapServiceKeys', () => {
    beforeAll(() => {
        fetch.mockReset()
    })

    it('returns correct status - AZURE_LAYER 1', async () => {
        const systemSettings = {
            keyBingMapsApiKey: AZURE_LAYER_KEY,
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(AZURE_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateMapServiceKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: AZURE_LAYER_KEY,
            [BING_LAYER]: false,
        })
    })

    it('returns correct status - AZURE_LAYER 2', async () => {
        const systemSettings = {
            keyAzureMapsApiKey: AZURE_LAYER_KEY,
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(AZURE_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateMapServiceKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: AZURE_LAYER_KEY,
            [BING_LAYER]: false,
        })
    })

    it('returns correct status - BING_LAYER', async () => {
        const systemSettings = {
            keyBingMapsApiKey: BING_LAYER_KEY,
        }
        global.fetch = jest.fn((url) => {
            if (url.startsWith(findValidationByType(BING_LAYER).url)) {
                return Promise.resolve({ ok: true })
            }
            return Promise.resolve({ ok: false })
        })

        const keysStatus = await validateMapServiceKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: false,
            [BING_LAYER]: BING_LAYER_KEY,
        })
    })

    it('returns correct status - invalid key', async () => {
        const systemSettings = {
            keyBingMapsApiKey: 'invalid_api_key',
        }
        global.fetch = jest.fn(() => Promise.resolve({ ok: false }))

        const keysStatus = await validateMapServiceKeys(systemSettings)
        expect(keysStatus).toEqual({
            [AZURE_LAYER]: false,
            [BING_LAYER]: false,
        })
    })

    it('returns correct status - missing key', async () => {
        const systemSettings = {}

        const keysStatus = await validateMapServiceKeys(systemSettings)
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

    it('calls getFallbackBasemap and returns fallback basemap if neither id nor defaultId are found', () => {
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

describe('utils/basemaps - getBasemapList', () => {
    const MAP_SERVICE_XYZ = 'XYZ'
    const IMAGE_FORMAT = 'PNG'

    it('returns default basemaps matching supported layer types, with apiKeys if present', async () => {
        const mockValidateMapServiceKeys = jest.fn().mockResolvedValue({
            azureLayer: AZURE_LAYER_KEY,
            bingLayer: false,
        })

        const externalMapLayers = []

        const result = await getBasemapList({
            externalMapLayers,
            systemSettings: {},
            validationFn: mockValidateMapServiceKeys,
        })

        expect(result).toEqual([
            {
                id: 'azureLayerId',
                config: { type: AZURE_LAYER, apiKey: AZURE_LAYER_KEY },
            },
        ])
    })

    it('includes external basemaps matching supported map services', async () => {
        const mockValidateMapServiceKeys = jest.fn().mockResolvedValue({
            azureLayer: AZURE_LAYER_KEY,
            bingLayer: false,
        })

        const externalMapLayers = [
            {
                id: 'ext1',
                name: 'External 1',
                url: 'https://path-to-xyz',
                mapService: MAP_SERVICE_XYZ,
                imageFormat: IMAGE_FORMAT,
                mapLayerPosition: MAP_LAYER_POSITION_BASEMAP,
            },
            {
                id: 'ext2',
                name: 'External 2',
                url: 'https://path-to-xyz',
                mapService: MAP_SERVICE_XYZ,
                imageFormat: IMAGE_FORMAT,
                mapLayerPosition: MAP_LAYER_POSITION_OVERLAY,
            },
        ]

        const result = await getBasemapList({
            externalMapLayers,
            systemSettings: {},
            validationFn: mockValidateMapServiceKeys,
        })

        expect(result.some((b) => b.id === 'azureLayerId')).toBe(true)
        expect(result.some((b) => b.id === 'bingLayerId')).toBe(false)
        expect(result.some((b) => b.id === 'ext1')).toBe(true)
        expect(result.some((b) => b.id === 'ext2')).toBe(false)
    })
})
