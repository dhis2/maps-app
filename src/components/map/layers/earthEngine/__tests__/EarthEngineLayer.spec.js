import EarthEngineLayer from '../EarthEngineLayer.jsx'

jest.mock('../../../MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('EarthEngineLayer highlighted feature', () => {
    test('outlines the highlighted feature again after the layer is rebuilt', async () => {
        jest.spyOn(
            EarthEngineLayer.prototype,
            'createLayer'
        ).mockResolvedValue()
        const layer = new EarthEngineLayer({
            id: 'layer1',
            feature: { id: 'a', layerId: 'layer1' },
        })
        const rebuilt = { highlight: jest.fn() }
        layer.clearAggregations = jest.fn()
        layer.removeLayer = jest.fn()
        layer.createLayer = jest.fn(() => {
            layer.layer = rebuilt
        })
        layer.setLayerOrder = jest.fn()
        await layer.updateLayer()
        expect(rebuilt.highlight).toHaveBeenCalledWith('a')
    })
})
