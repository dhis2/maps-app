import earthEngineLoader from '../earthEngineLoader.js'
import { loadLayer } from '../loadLayer.js'

jest.mock('../earthEngineLoader.js', () => jest.fn())
jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
    poleOfInaccessibility: jest.fn(),
}))

describe('loadLayer', () => {
    const config = { id: 'layer1', layer: 'earthEngine', name: 'Heat stress' }
    const context = { engine: {}, serverVersion: { minor: 43 } }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        console.error.mockRestore()
    })

    it('calls the loader of the layer type with the context', async () => {
        earthEngineLoader.mockResolvedValue({ ...config, isLoaded: true })

        const result = await loadLayer(config, context)

        expect(earthEngineLoader).toHaveBeenCalledWith({ config, ...context })
        expect(result).toEqual({ ...config, isLoaded: true })
    })

    it('turns a thrown error into a loaded layer with an error alert', async () => {
        const error = new Error('Boom')
        earthEngineLoader.mockRejectedValue(error)

        const result = await loadLayer(config, context)

        expect(result).toMatchObject({
            ...config,
            isLoaded: true,
            isLoading: false,
        })
        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'LOAD_FAILED',
                severity: 'error',
                details: { message: 'Boom' },
            }),
        ])
        // Kept for developers, as the alert only has the message
        expect(console.error).toHaveBeenCalledWith(error)
    })

    it('handles an unknown layer type the same way', async () => {
        const result = await loadLayer({ id: 'layer2', layer: 'unknown' }, {})

        expect(result).toMatchObject({ name: 'Layer', isLoaded: true })
        expect(result.alerts[0].details.message).toBe(
            'Unknown layer type: unknown'
        )
    })
})
