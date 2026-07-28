import * as types from '../../constants/actionTypes.js'
import dataTable from '../dataTable.js'

const initialState = {
    openIds: [],
    combinedView: false,
    joinConfig: {
        level: 'orgUnit',
        layerIds: [],
        pointLayerId: null,
        polygonLayerId: null,
    },
}

describe('dataTable reducer', () => {
    it('returns the initial state by default', () => {
        expect(dataTable(undefined, {})).toEqual(initialState)
    })

    it.each([
        types.DATA_TABLE_CLOSE,
        types.MAP_NEW,
        types.DOWNLOAD_MODE_CLOSE,
        types.DOWNLOAD_MODE_OPEN,
    ])('resets to the initial state on %s', (type) => {
        const state = {
            openIds: ['layer1', 'layer2'],
            combinedView: true,
            joinConfig: {
                level: 'spatial',
                layerIds: [],
                pointLayerId: 'layer1',
                polygonLayerId: 'layer2',
            },
        }

        expect(dataTable(state, { type })).toEqual(initialState)
    })

    describe('MAP_SET', () => {
        it('restores dataTable state from the payload when present', () => {
            const restored = {
                openIds: ['layer1'],
                combinedView: false,
                joinConfig: {
                    level: 'parentOrgUnit',
                    layerIds: ['layer1', 'layer3'],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            }

            expect(
                dataTable(initialState, {
                    type: types.MAP_SET,
                    payload: { dataTable: restored },
                })
            ).toEqual(restored)
        })

        it('falls back to the initial state when the payload has no dataTable', () => {
            const state = {
                openIds: ['layer1'],
                combinedView: false,
                joinConfig: {
                    level: 'orgUnit',
                    layerIds: ['layer1', 'layer2'],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            }

            expect(
                dataTable(state, {
                    type: types.MAP_SET,
                    payload: {},
                })
            ).toEqual(initialState)
        })
    })

    describe('DATA_TABLE_TOGGLE', () => {
        it('opens a layer tab that was not open', () => {
            const state = dataTable(initialState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer1',
            })

            expect(state.openIds).toEqual(['layer1'])
        })

        it('appends to openIds without closing other tabs', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1'] },
                { type: types.DATA_TABLE_TOGGLE, id: 'layer2' }
            )

            expect(state.openIds).toEqual(['layer1', 'layer2'])
        })

        it('closes an already-open tab', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1', 'layer2'] },
                { type: types.DATA_TABLE_TOGGLE, id: 'layer1' }
            )

            expect(state.openIds).toEqual(['layer2'])
        })

        it('leaves combinedView and joinConfig untouched', () => {
            const prevState = {
                openIds: ['layer1'],
                combinedView: true,
                joinConfig: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: 'layerA',
                    polygonLayerId: 'layerB',
                },
            }

            const state = dataTable(prevState, {
                type: types.DATA_TABLE_TOGGLE,
                id: 'layer2',
            })

            expect(state.combinedView).toBe(true)
            expect(state.joinConfig).toBe(prevState.joinConfig)
        })
    })

    describe('LAYER_REMOVE', () => {
        it('removes the layer from openIds', () => {
            const state = dataTable(
                { ...initialState, openIds: ['layer1', 'layer2'] },
                { type: types.LAYER_REMOVE, id: 'layer1' }
            )

            expect(state.openIds).toEqual(['layer2'])
        })

        it('clears the removed layer from joinConfig.layerIds', () => {
            const prevState = {
                ...initialState,
                joinConfig: {
                    level: 'orgUnit',
                    layerIds: ['layer1', 'layer2', 'layer3'],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer2',
            })

            expect(state.joinConfig.layerIds).toEqual(['layer1', 'layer3'])
        })

        it('clears a dangling pointLayerId/polygonLayerId reference', () => {
            const prevState = {
                ...initialState,
                joinConfig: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: 'layer1',
                    polygonLayerId: 'layer2',
                },
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
            })

            expect(state.joinConfig.pointLayerId).toBe(null)
            expect(state.joinConfig.polygonLayerId).toBe('layer2')
        })

        it('turns combinedView off when the removal makes an orgUnit/parentOrgUnit join insufficient', () => {
            const prevState = {
                openIds: [],
                combinedView: true,
                joinConfig: {
                    level: 'orgUnit',
                    layerIds: ['layer1', 'layer2'],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
            })

            expect(state.combinedView).toBe(false)
        })

        it('turns combinedView off when the removal makes a spatial join insufficient', () => {
            const prevState = {
                openIds: [],
                combinedView: true,
                joinConfig: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: 'layer1',
                    polygonLayerId: 'layer2',
                },
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer2',
            })

            expect(state.combinedView).toBe(false)
        })

        it('keeps combinedView on when the removal leaves the join sufficient', () => {
            const prevState = {
                openIds: [],
                combinedView: true,
                joinConfig: {
                    level: 'orgUnit',
                    layerIds: ['layer1', 'layer2', 'layer3'],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            }

            const state = dataTable(prevState, {
                type: types.LAYER_REMOVE,
                id: 'layer1',
            })

            expect(state.combinedView).toBe(true)
            expect(state.joinConfig.layerIds).toEqual(['layer2', 'layer3'])
        })
    })

    describe('DATA_TABLE_COMBINED_VIEW_TOGGLE', () => {
        it('turns combinedView on', () => {
            const state = dataTable(initialState, {
                type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE,
            })

            expect(state.combinedView).toBe(true)
        })

        it('turns combinedView off', () => {
            const state = dataTable(
                { ...initialState, combinedView: true },
                { type: types.DATA_TABLE_COMBINED_VIEW_TOGGLE }
            )

            expect(state.combinedView).toBe(false)
        })
    })

    describe('DATA_TABLE_JOIN_CONFIG_SET', () => {
        it('replaces joinConfig wholesale', () => {
            const config = {
                level: 'spatial',
                layerIds: [],
                pointLayerId: 'layer1',
                polygonLayerId: 'layer2',
            }

            const state = dataTable(initialState, {
                type: types.DATA_TABLE_JOIN_CONFIG_SET,
                config,
            })

            expect(state.joinConfig).toEqual(config)
        })
    })

    it('returns the current state for unknown actions', () => {
        const state = { ...initialState, openIds: ['layer1'] }

        expect(dataTable(state, { type: 'UNKNOWN' })).toBe(state)
    })
})
