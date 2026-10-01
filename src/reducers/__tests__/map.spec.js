import * as types from '../../constants/actionTypes.js'
import { isValidUid } from '../../util/uid.js'
import map, { defaultBasemapState } from '../map.js'

// The Layers panel renders overlay layers in the REVERSE of `mapViews` order
// (top of panel = last map view), so LAYER_SORT translates an oldIndex/newIndex
// pair from that display order back into mapViews order.
describe('map reducer - LAYER_SORT', () => {
    const layer = (id) => ({ id })

    // Stored order [A, B, C]  ->  displayed (reversed) order [C, B, A]
    const stateWith = (...ids) => ({
        mapViews: ids.map(layer),
    })

    const displayedIds = (state) =>
        [...state.mapViews].reverse().map((mv) => mv.id)

    it('moving the top layer to the bottom (display space) reorders mapViews', () => {
        // Displayed: [C, B, A]  -> drag C (index 0) down to index 2 -> [B, A, C]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 0,
            newIndex: 2,
        })

        expect(displayedIds(result)).toEqual(['B', 'A', 'C'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['C', 'A', 'B'])
    })

    it('moving the bottom layer to the top (display space) reorders mapViews', () => {
        // Displayed: [C, B, A]  -> drag A (index 2) up to index 0 -> [A, C, B]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 2,
            newIndex: 0,
        })

        expect(displayedIds(result)).toEqual(['A', 'C', 'B'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['B', 'C', 'A'])
    })

    it('swapping two adjacent layers in display space swaps them in mapViews', () => {
        // Displayed: [C, B, A]  -> drag B (index 1) up to index 0 -> [B, C, A]
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 1,
            newIndex: 0,
        })

        expect(displayedIds(result)).toEqual(['B', 'C', 'A'])
        expect(result.mapViews.map((mv) => mv.id)).toEqual(['A', 'C', 'B'])
    })

    it('is a no-op when oldIndex === newIndex', () => {
        const state = stateWith('A', 'B', 'C')

        const result = map(state, {
            type: types.LAYER_SORT,
            oldIndex: 1,
            newIndex: 1,
        })

        expect(result.mapViews.map((mv) => mv.id)).toEqual(['A', 'B', 'C'])
    })

    it('does not mutate the original state', () => {
        const state = stateWith('A', 'B', 'C')
        const before = state.mapViews

        map(state, { type: types.LAYER_SORT, oldIndex: 0, newIndex: 2 })

        expect(state.mapViews).toBe(before)
        expect(state.mapViews.map((mv) => mv.id)).toEqual(['A', 'B', 'C'])
    })
})

const defaultState = {
    bounds: [
        [-18.7, -34.9],
        [50.2, 35.9],
    ],
    basemap: defaultBasemapState,
    mapViews: [],
}

describe('map reducer - MAP_NEW / MAP_SET', () => {
    it('resets to the default state when starting a new map', () => {
        const state = {
            bounds: [
                [0, 0],
                [1, 1],
            ],
            basemap: { id: 'osm' },
            mapViews: [{ id: 'layer1' }],
        }

        expect(map(state, { type: types.MAP_NEW })).toEqual(defaultState)
    })

    it('merges the payload into the default state when setting the map', () => {
        const result = map(defaultState, {
            type: types.MAP_SET,
            payload: {
                bounds: [
                    [0, 0],
                    [1, 1],
                ],
                mapViews: [{ id: 'layer1' }],
                basemap: { opacity: 0.5 },
            },
        })

        expect(result).toEqual({
            bounds: [
                [0, 0],
                [1, 1],
            ],
            mapViews: [{ id: 'layer1' }],
            basemap: { ...defaultBasemapState, opacity: 0.5 },
        })
    })
})

describe('map reducer - MAP_PROPS_SET / MAP_COORDINATE_OPEN / MAP_COORDINATE_CLOSE', () => {
    it('merges props into the state', () => {
        const result = map(defaultState, {
            type: types.MAP_PROPS_SET,
            payload: { zoom: 5, center: [1, 2] },
        })

        expect(result.zoom).toBe(5)
        expect(result.center).toEqual([1, 2])
    })

    it('opens the coordinate popup', () => {
        const result = map(defaultState, {
            type: types.MAP_COORDINATE_OPEN,
            payload: [1, 2],
        })

        expect(result.coordinatePopup).toEqual([1, 2])
    })

    it('closes the coordinate popup', () => {
        const state = { ...defaultState, coordinatePopup: [1, 2] }

        const result = map(state, { type: types.MAP_COORDINATE_CLOSE })

        expect(result.coordinatePopup).toBe(null)
    })
})

describe('map reducer - basemap actions', () => {
    it('replaces the basemap when selecting a different one', () => {
        const state = {
            ...defaultState,
            basemap: { id: 'osm', isVisible: true, isExpanded: true },
        }

        const result = map(state, {
            type: types.BASEMAP_SELECTED,
            payload: { id: 'satellite' },
        })

        expect(result.basemap).toEqual({
            id: 'satellite',
            isVisible: true,
            isExpanded: true,
        })
    })

    it('is a no-op when selecting the already-active basemap', () => {
        const basemap = { id: 'osm', isVisible: true, isExpanded: true }
        const state = { ...defaultState, basemap }

        const result = map(state, {
            type: types.BASEMAP_SELECTED,
            payload: { id: 'osm' },
        })

        expect(result.basemap).toBe(basemap)
    })

    it('sets the basemap opacity', () => {
        const state = { ...defaultState, basemap: { opacity: 1 } }

        const result = map(state, {
            type: types.BASEMAP_CHANGE_OPACITY,
            opacity: 0.5,
        })

        expect(result.basemap.opacity).toBe(0.5)
    })

    it('toggles basemap expand', () => {
        const state = { ...defaultState, basemap: { isExpanded: true } }

        const result = map(state, { type: types.BASEMAP_TOGGLE_EXPAND })

        expect(result.basemap.isExpanded).toBe(false)
    })

    it('toggles basemap visibility', () => {
        const state = { ...defaultState, basemap: { isVisible: true } }

        const result = map(state, { type: types.BASEMAP_TOGGLE_VISIBILITY })

        expect(result.basemap.isVisible).toBe(false)
    })
})

describe('map reducer - LAYER_ADD', () => {
    it('adds a new layer with a generated id and defaults isVisible to true', () => {
        const result = map(
            { ...defaultState, mapViews: [] },
            {
                type: types.LAYER_ADD,
                payload: { type: 'thematic', name: 'Layer 1' },
            }
        )

        expect(result.mapViews).toHaveLength(1)
        expect(isValidUid(result.mapViews[0].id)).toBe(true)
        expect(result.mapViews[0].name).toBe('Layer 1')
        expect(result.mapViews[0].isVisible).toBe(true)
    })

    it('respects an explicit isVisible value', () => {
        const result = map(
            { ...defaultState, mapViews: [] },
            {
                type: types.LAYER_ADD,
                payload: { id: 'ext1', type: 'external', isVisible: false },
            }
        )

        expect(result.mapViews[0].isVisible).toBe(false)
    })

    it('does not re-add a layer whose id already exists (external layers can only be added once)', () => {
        const existing = { id: 'ext1', type: 'external' }
        const state = { ...defaultState, mapViews: [existing] }

        const result = map(state, {
            type: types.LAYER_ADD,
            payload: { id: 'ext1', type: 'external' },
        })

        expect(result).toBe(state)
    })
})

describe('map reducer - LAYER_REMOVE / LAYER_DUPLICATE', () => {
    it('removes a layer by id', () => {
        const state = {
            ...defaultState,
            mapViews: [{ id: 'layer1' }, { id: 'layer2' }],
        }

        const result = map(state, { type: types.LAYER_REMOVE, id: 'layer1' })

        expect(result.mapViews).toEqual([{ id: 'layer2' }])
    })

    it('returns state unchanged when duplicating a layer that is not found', () => {
        const state = { ...defaultState, mapViews: [{ id: 'layer1' }] }

        const result = map(state, {
            type: types.LAYER_DUPLICATE,
            id: 'missing',
        })

        expect(result).toBe(state)
    })

    it('inserts a duplicate right after the source, with a new id and no isLoading/coordinate', () => {
        const state = {
            ...defaultState,
            mapViews: [
                {
                    id: 'layer1',
                    name: 'Layer 1',
                    isLoading: true,
                    coordinate: [1, 2],
                },
                { id: 'layer2', name: 'Layer 2' },
            ],
        }

        const result = map(state, {
            type: types.LAYER_DUPLICATE,
            id: 'layer1',
        })

        expect(result.mapViews).toHaveLength(3)
        expect(result.mapViews[0]).toBe(state.mapViews[0])

        const duplicate = result.mapViews[1]
        expect(duplicate.name).toBe('Layer 1')
        expect(duplicate.id).not.toBe('layer1')
        expect(isValidUid(duplicate.id)).toBe(true)
        expect(duplicate.isLoading).toBeUndefined()
        expect(duplicate.coordinate).toBeUndefined()

        expect(result.mapViews[2]).toBe(state.mapViews[1])
    })
})

describe('map reducer - per-layer delegation', () => {
    describe('LAYER_UPDATE', () => {
        it('replaces the matching layer and leaves others untouched', () => {
            const other = { id: 'layer2', name: 'Other' }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1', name: 'Old' }, other],
            }

            const result = map(state, {
                type: types.LAYER_UPDATE,
                payload: { id: 'layer1', name: 'New', opacity: 0.5 },
            })

            expect(result.mapViews[0]).toEqual({
                id: 'layer1',
                name: 'New',
                opacity: 0.5,
            })
            expect(result.mapViews[1]).toBe(other)
        })

        it("keeps the live dataTableColumnConfig/dataFilters instead of an async loader payload's stale snapshot", () => {
            const state = {
                ...defaultState,
                mapViews: [
                    {
                        id: 'layer1',
                        name: 'Old',
                        dataTableColumnConfig: { visibleKeys: ['name'] },
                        dataFilters: { name: 'foo' },
                    },
                ],
            }

            const result = map(state, {
                type: types.LAYER_UPDATE,
                payload: {
                    id: 'layer1',
                    name: 'New',
                    // Stale: captured before the user's edits above
                    dataTableColumnConfig: undefined,
                    dataFilters: undefined,
                },
            })

            expect(result.mapViews[0].dataTableColumnConfig).toEqual({
                visibleKeys: ['name'],
            })
            expect(result.mapViews[0].dataFilters).toEqual({ name: 'foo' })
        })

        it("uses the payload's dataTableColumnConfig/dataFilters when the layer has none live yet (first load)", () => {
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1', name: 'Old' }],
            }

            const result = map(state, {
                type: types.LAYER_UPDATE,
                payload: {
                    id: 'layer1',
                    name: 'New',
                    dataTableColumnConfig: { visibleKeys: ['id'] },
                },
            })

            expect(result.mapViews[0].dataTableColumnConfig).toEqual({
                visibleKeys: ['id'],
            })
        })
    })

    describe('LAYER_EDIT', () => {
        it('does not modify any mapView (the layer sub-reducer has no matching case)', () => {
            const layer1 = { id: 'layer1', name: 'Original' }
            const state = { ...defaultState, mapViews: [layer1] }

            const result = map(state, {
                type: types.LAYER_EDIT,
                payload: { id: 'layer1', name: 'Changed' },
            })

            expect(result.mapViews[0]).toBe(layer1)
            expect(result.mapViews).not.toBe(state.mapViews)
        })
    })

    describe('LAYER_CHANGE_OPACITY', () => {
        it('updates the matching layer only', () => {
            const other = { id: 'layer2', opacity: 1 }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1', opacity: 1 }, other],
            }

            const result = map(state, {
                type: types.LAYER_CHANGE_OPACITY,
                id: 'layer1',
                opacity: 0.3,
            })

            expect(result.mapViews[0].opacity).toBe(0.3)
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('LAYER_LOADING_SET', () => {
        it('sets isLoading on the matching layer only', () => {
            const other = { id: 'layer2' }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1' }, other],
            }

            const result = map(state, {
                type: types.LAYER_LOADING_SET,
                id: 'layer1',
            })

            expect(result.mapViews[0].isLoading).toBe(true)
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('LAYER_TOGGLE_VISIBILITY', () => {
        it('toggles isVisible on the matching layer only', () => {
            const other = { id: 'layer2', isVisible: true }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1', isVisible: true }, other],
            }

            const result = map(state, {
                type: types.LAYER_TOGGLE_VISIBILITY,
                id: 'layer1',
            })

            expect(result.mapViews[0].isVisible).toBe(false)
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('LAYER_FORCE_CLIENT_CLUSTER_SET', () => {
        it('sets forceClientCluster on the matching layer only', () => {
            const other = { id: 'layer2' }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1' }, other],
            }

            const result = map(state, {
                type: types.LAYER_FORCE_CLIENT_CLUSTER_SET,
                id: 'layer1',
            })

            expect(result.mapViews[0].forceClientCluster).toBe(true)
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('LAYER_TOGGLE_EXPAND', () => {
        it('toggles isExpanded on the matching layer only', () => {
            const other = { id: 'layer2', isExpanded: true }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1', isExpanded: true }, other],
            }

            const result = map(state, {
                type: types.LAYER_TOGGLE_EXPAND,
                id: 'layer1',
            })

            expect(result.mapViews[0].isExpanded).toBe(false)
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('DATA_FILTER_SET', () => {
        it('sets a data filter field on the matching layer only', () => {
            const other = { id: 'layer2' }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1' }, other],
            }

            const result = map(state, {
                type: types.DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'field1',
                filter: { operator: 'eq', value: 1 },
            })

            expect(result.mapViews[0].dataFilters).toEqual({
                field1: { operator: 'eq', value: 1 },
            })
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('DATA_FILTER_CLEAR', () => {
        it('removes a data filter field on the matching layer only', () => {
            const other = { id: 'layer2' }
            const state = {
                ...defaultState,
                mapViews: [
                    {
                        id: 'layer1',
                        dataFilters: { field1: {}, field2: {} },
                    },
                    other,
                ],
            }

            const result = map(state, {
                type: types.DATA_FILTER_CLEAR,
                layerId: 'layer1',
                fieldId: 'field1',
            })

            expect(result.mapViews[0].dataFilters).toEqual({ field2: {} })
            expect(result.mapViews[1]).toBe(other)
        })
    })

    describe('MAP_EARTH_ENGINE_VALUE_SHOW', () => {
        it('sets the coordinate on the matching layer only', () => {
            const other = { id: 'layer2' }
            const state = {
                ...defaultState,
                mapViews: [{ id: 'layer1' }, other],
            }

            const result = map(state, {
                type: types.MAP_EARTH_ENGINE_VALUE_SHOW,
                layerId: 'layer1',
                coordinate: [1, 2],
            })

            expect(result.mapViews[0].coordinate).toEqual([1, 2])
            expect(result.mapViews[1]).toBe(other)
        })
    })
})

describe('map reducer - MAP_ALERTS_CLEAR', () => {
    it('clears top-level alerts and per-layer alerts', () => {
        const state = {
            ...defaultState,
            alerts: [{ message: 'Oops' }],
            mapViews: [{ id: 'layer1', alerts: [{ message: 'Layer error' }] }],
        }

        const result = map(state, { type: types.MAP_ALERTS_CLEAR })

        expect(result.alerts).toBeUndefined()
        expect(result.mapViews[0].alerts).toBeUndefined()
    })
})

describe('map reducer - MAP_PERIODS_SYNC', () => {
    it('adds a new pe filter for map views matching the rendering strategy', () => {
        const state = {
            ...defaultState,
            mapViews: [
                {
                    id: 'layer1',
                    renderingStrategy: 'SINGLE',
                    filters: [{ dimension: 'dx', items: [] }],
                },
            ],
        }
        const periods = [{ id: '2021' }]

        const result = map(state, {
            type: types.MAP_PERIODS_SYNC,
            renderingStrategy: 'SINGLE',
            periods,
        })

        expect(result.mapViews[0].filters).toEqual([
            { dimension: 'dx', items: [] },
            { dimension: 'pe', items: periods },
        ])
        expect(result.mapViews[0].isLoaded).toBe(false)
    })

    it('updates an existing pe filter in place', () => {
        const state = {
            ...defaultState,
            mapViews: [
                {
                    id: 'layer1',
                    renderingStrategy: 'SINGLE',
                    filters: [{ dimension: 'pe', items: [{ id: '2020' }] }],
                },
            ],
        }
        const periods = [{ id: '2021' }]

        const result = map(state, {
            type: types.MAP_PERIODS_SYNC,
            renderingStrategy: 'SINGLE',
            periods,
        })

        expect(result.mapViews[0].filters).toEqual([
            { dimension: 'pe', items: periods },
        ])
    })

    it('leaves map views with a different rendering strategy untouched', () => {
        const other = { id: 'layer1', renderingStrategy: 'TIMELINE' }
        const state = { ...defaultState, mapViews: [other] }

        const result = map(state, {
            type: types.MAP_PERIODS_SYNC,
            renderingStrategy: 'SINGLE',
            periods: [{ id: '2021' }],
        })

        expect(result.mapViews[0]).toBe(other)
    })
})

describe('map reducer - default', () => {
    it('returns the default state by default', () => {
        expect(map(undefined, { type: 'UNKNOWN' })).toEqual(defaultState)
    })

    it('returns the current state for unknown actions', () => {
        expect(map(defaultState, { type: 'UNKNOWN' })).toBe(defaultState)
    })
})
