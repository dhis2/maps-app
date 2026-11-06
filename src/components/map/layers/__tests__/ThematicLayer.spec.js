import ThematicLayer from '../ThematicLayer.jsx'

jest.mock('../../MapApi.js', () => ({
    poleOfInaccessibility: jest.fn(),
}))

const createLayer = () => {
    const instance = Object.create(ThematicLayer.prototype)
    instance.props = {
        id: 'layer1',
        feature: null,
        externalPeriod: { id: '202301' },
    }
    instance.state = {}
    instance.context = { map: { fitBounds: jest.fn() } }
    instance.layer = { highlight: jest.fn(), setData: jest.fn() }
    instance.buildPeriodData = () => []
    return instance
}

const update = (instance, props) => {
    const prevProps = instance.props
    instance.props = { ...prevProps, ...props }
    instance.componentDidUpdate(prevProps)
}

describe('ThematicLayer highlighted feature', () => {
    test('outlines the highlighted feature without replacing the period data', () => {
        const layer = createLayer()
        update(layer, { feature: { id: 'a', layerId: 'layer1' } })
        expect(layer.layer.highlight).toHaveBeenCalledWith('a')
        expect(layer.layer.setData).not.toHaveBeenCalled()
    })

    test('outlines the highlighted feature again when the next timeline period replaces the data', () => {
        const layer = createLayer()
        update(layer, { feature: { id: 'a', layerId: 'layer1' } })
        update(layer, { externalPeriod: { id: '202302' } })
        expect(layer.layer.setData).toHaveBeenCalledTimes(1)
        expect(layer.layer.highlight).toHaveBeenCalledTimes(2)
        expect(layer.layer.highlight).toHaveBeenLastCalledWith('a')
    })
})
