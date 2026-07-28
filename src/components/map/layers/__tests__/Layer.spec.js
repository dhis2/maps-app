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

    test('recognizes a crossLayerIds-only selection (no own-layer selection.layerId)', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: {
                layerId: null,
                ids: [],
                crossLayerIds: { layer1: ['a', 'c'] },
            },
            selectionFilter: ['selected'],
        })
        expect(layer.getVisibleIds()).toEqual(['a', 'c'])
    })

    test('returns null when this layer has no entry in crossLayerIds either', () => {
        const layer = createLayer({
            id: 'layer1',
            data,
            selection: {
                layerId: null,
                ids: [],
                crossLayerIds: { 'other-layer': ['a'] },
            },
            selectionFilter: ['selected'],
        })
        expect(layer.getVisibleIds()).toBe(null)
    })
})

describe('Layer#getHoverIds', () => {
    test('returns an empty array when there is no feature', () => {
        const layer = createLayer({ id: 'layer1', feature: null })
        expect(layer.getHoverIds()).toEqual([])
    })

    test("returns this layer's own hover id when feature.layerId matches", () => {
        const layer = createLayer({
            id: 'layer1',
            feature: { id: 'a', layerId: 'layer1' },
        })
        expect(layer.getHoverIds()).toEqual(['a'])
    })

    test("returns an empty array when the feature belongs to a different layer and there's no crossLayerIds entry", () => {
        const layer = createLayer({
            id: 'layer1',
            feature: { id: 'a', layerId: 'other-layer' },
        })
        expect(layer.getHoverIds()).toEqual([])
    })

    test("merges this layer's crossLayerIds entry alongside its own hover id", () => {
        const layer = createLayer({
            id: 'layer1',
            feature: {
                id: 'a',
                layerId: 'layer1',
                crossLayerIds: { layer1: ['x', 'y'] },
            },
        })
        expect(layer.getHoverIds()).toEqual(['a', 'x', 'y'])
    })

    test('returns only crossLayerIds when the feature has no own-layer match', () => {
        const layer = createLayer({
            id: 'layer1',
            feature: {
                layerId: null,
                crossLayerIds: { layer1: ['x', 'y'], layer2: ['z'] },
            },
        })
        expect(layer.getHoverIds()).toEqual(['x', 'y'])
    })
})

describe('Layer#getSelectedIds', () => {
    test('returns an empty array when there is no selection', () => {
        const layer = createLayer({ id: 'layer1', selection: null })
        expect(layer.getSelectedIds()).toEqual([])
    })

    test("returns this layer's own selected ids when selection.layerId matches", () => {
        const layer = createLayer({
            id: 'layer1',
            selection: { layerId: 'layer1', ids: ['a', 'b'] },
        })
        expect(layer.getSelectedIds()).toEqual(['a', 'b'])
    })

    test('merges crossLayerIds with a same-layer selection, deduping', () => {
        const layer = createLayer({
            id: 'layer1',
            selection: {
                layerId: 'layer1',
                ids: ['a'],
                crossLayerIds: { layer1: ['a', 'b'] },
            },
        })
        expect(layer.getSelectedIds()).toEqual(['a', 'b'])
    })

    test('returns only crossLayerIds when the selection has no own-layer match', () => {
        const layer = createLayer({
            id: 'layer1',
            selection: {
                layerId: null,
                ids: [],
                crossLayerIds: { layer1: ['x'], layer2: ['y'] },
            },
        })
        expect(layer.getSelectedIds()).toEqual(['x'])
    })
})
