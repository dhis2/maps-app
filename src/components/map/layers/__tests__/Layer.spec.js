import Layer from '../Layer.js'

const createLayer = (props) => {
    const instance = Object.create(Layer.prototype)
    instance.props = props
    return instance
}

describe('Layer#getVisibleIds', () => {
    const data = [
        { properties: { id: 'a' } },
        { properties: { id: 'b' } },
        { properties: { id: 'c' } },
    ]

    test('returns null (show everything) when selectionFilter is empty', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: { layerId: 'layer1', ids: ['a'] },
            selectionFilter: [],
        })
        expect(layer.getVisibleIds()).toBe(null)
    })

    test('returns null when the selection belongs to a different layer', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: { layerId: 'other-layer', ids: ['a'] },
            selectionFilter: ['selected'],
        })
        expect(layer.getVisibleIds()).toBe(null)
    })

    test('returns only the selected ids when filtered to "selected"', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: { layerId: 'layer1', ids: ['a', 'c'] },
            selectionFilter: ['selected'],
        })
        expect(layer.getVisibleIds()).toEqual(['a', 'c'])
    })

    test('returns only the non-selected ids when filtered to "not-selected"', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: { layerId: 'layer1', ids: ['a'] },
            selectionFilter: ['not-selected'],
        })
        expect(layer.getVisibleIds()).toEqual(['b', 'c'])
    })

    test('returns null (show everything) when both options are checked', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: { layerId: 'layer1', ids: ['a'] },
            selectionFilter: ['selected', 'not-selected'],
        })
        expect(layer.getVisibleIds()).toBe(null)
    })
})
