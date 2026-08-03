import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../constants/layers.js'
import useLayersPeriodSync from '../useLayersPeriodSync.js'

const mockStore = configureMockStore()

const renderWithStore = (state) => {
    const store = mockStore(state)
    const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    )
    const { result } = renderHook(() => useLayersPeriodSync(), { wrapper })
    return { result, store }
}

describe('useLayersPeriodSync', () => {
    describe('defaultRenderingStrategy', () => {
        it('defaults to SINGLE when no Timeline or Split layer exists', () => {
            const { result } = renderWithStore({
                map: { mapViews: [] },
                layerEdit: {},
            })

            expect(result.current.defaultRenderingStrategy).toBe(
                RENDERING_STRATEGY_SINGLE
            )
        })

        it('defaults to TIMELINE when a Timeline layer exists', () => {
            const { result } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [
                                { dimension: 'pe', items: [{ id: 'X' }] },
                            ],
                        },
                    ],
                },
                layerEdit: {},
            })

            expect(result.current.defaultRenderingStrategy).toBe(
                RENDERING_STRATEGY_TIMELINE
            )
        })

        it('defaults to SPLIT_BY_PERIOD when only a Split layer exists', () => {
            const { result } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy:
                                RENDERING_STRATEGY_SPLIT_BY_PERIOD,
                            filters: [
                                { dimension: 'pe', items: [{ id: 'X' }] },
                            ],
                        },
                    ],
                },
                layerEdit: {},
            })

            expect(result.current.defaultRenderingStrategy).toBe(
                RENDERING_STRATEGY_SPLIT_BY_PERIOD
            )
        })
    })

    describe('shouldSyncFromOtherLayers', () => {
        it('is true when the layer opens on Single and a Timeline sibling exists', () => {
            const { result } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [
                                { dimension: 'pe', items: [{ id: 'X' }] },
                            ],
                        },
                    ],
                },
                layerEdit: { renderingStrategy: RENDERING_STRATEGY_SINGLE },
            })

            expect(result.current.shouldSyncFromOtherLayers).toBe(true)
        })

        it('is false when the layer opens on Single and no sibling exists', () => {
            const { result } = renderWithStore({
                map: { mapViews: [] },
                layerEdit: { renderingStrategy: RENDERING_STRATEGY_SINGLE },
            })

            expect(result.current.shouldSyncFromOtherLayers).toBe(false)
        })

        it('is frozen false for the whole session when the layer opens on Timeline, regardless of siblings', () => {
            const { result } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'other',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [
                                { dimension: 'pe', items: [{ id: 'X' }] },
                            ],
                        },
                    ],
                },
                layerEdit: { renderingStrategy: RENDERING_STRATEGY_TIMELINE },
            })

            expect(result.current.shouldSyncFromOtherLayers).toBe(false)
        })
    })

    describe('syncFromOtherLayers', () => {
        it('dispatches setPeriods with the sibling periods and returns true when found', () => {
            const siblingPeriods = [{ id: 'LAST_12_MONTHS' }]
            const { result, store } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [
                                { dimension: 'pe', items: siblingPeriods },
                            ],
                        },
                    ],
                },
                layerEdit: {},
            })

            let synced
            act(() => {
                synced = result.current.syncFromOtherLayers({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(true)
            expect(store.getActions()).toEqual([
                { type: 'LAYER_EDIT_PERIODS_SET', periods: siblingPeriods },
            ])
        })

        it('returns false and dispatches nothing when no sibling periods are found', () => {
            const { result, store } = renderWithStore({
                map: { mapViews: [] },
                layerEdit: {},
            })

            let synced
            act(() => {
                synced = result.current.syncFromOtherLayers({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(false)
            expect(store.getActions()).toEqual([])
        })
    })

    describe('trySyncFromOtherLayersOnce', () => {
        const siblingPeriods = [{ id: 'LAST_12_MONTHS' }]
        const stateWithTimelineSibling = {
            map: {
                mapViews: [
                    {
                        id: 'a',
                        renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                        filters: [{ dimension: 'pe', items: siblingPeriods }],
                    },
                ],
            },
            layerEdit: { renderingStrategy: RENDERING_STRATEGY_SINGLE },
        }

        it('syncs on the first call', () => {
            const { result, store } = renderWithStore(stateWithTimelineSibling)

            let synced
            act(() => {
                synced = result.current.trySyncFromOtherLayersOnce({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(true)
            expect(store.getActions()).toEqual([
                { type: 'LAYER_EDIT_PERIODS_SET', periods: siblingPeriods },
            ])
        })

        it('does not re-sync on a second call, even after re-entering Timeline again', () => {
            const { result, store } = renderWithStore(stateWithTimelineSibling)

            act(() => {
                result.current.trySyncFromOtherLayersOnce({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            let secondCallResult
            act(() => {
                secondCallResult = result.current.trySyncFromOtherLayersOnce({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(secondCallResult).toBe(false)
            // Only the first call's dispatch should be recorded
            expect(store.getActions()).toEqual([
                { type: 'LAYER_EDIT_PERIODS_SET', periods: siblingPeriods },
            ])
        })

        it('never syncs when shouldSyncFromOtherLayers is false', () => {
            const { result, store } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [
                                { dimension: 'pe', items: siblingPeriods },
                            ],
                        },
                    ],
                },
                // Opens already on Timeline -> shouldSyncFromOtherLayers frozen false
                layerEdit: { renderingStrategy: RENDERING_STRATEGY_TIMELINE },
            })

            let synced
            act(() => {
                synced = result.current.trySyncFromOtherLayersOnce({
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(false)
            expect(store.getActions()).toEqual([])
        })
    })

    describe('syncToOtherLayers', () => {
        it('dispatches syncMapPeriods and returns true when a sibling with that strategy exists', () => {
            const periods = [{ id: 'LAST_12_MONTHS' }]
            const { result, store } = renderWithStore({
                map: {
                    mapViews: [
                        {
                            id: 'a',
                            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                            filters: [],
                        },
                    ],
                },
                layerEdit: {},
            })

            let synced
            act(() => {
                synced = result.current.syncToOtherLayers({
                    periods,
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(true)
            expect(store.getActions()).toEqual([
                {
                    type: 'MAP_PERIODS_SYNC',
                    periods,
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                },
            ])
        })

        it('returns false and dispatches nothing when no sibling with that strategy exists', () => {
            const { result, store } = renderWithStore({
                map: { mapViews: [] },
                layerEdit: {},
            })

            let synced
            act(() => {
                synced = result.current.syncToOtherLayers({
                    periods: [],
                    renderingStrategy: RENDERING_STRATEGY_TIMELINE,
                })
            })

            expect(synced).toBe(false)
            expect(store.getActions()).toEqual([])
        })
    })
})
