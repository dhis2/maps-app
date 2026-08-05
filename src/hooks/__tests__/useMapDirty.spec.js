import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { changeLayerOpacity } from '../../actions/layers.js'
import { setMap } from '../../actions/map.js'
import rootReducer from '../../reducers/index.js'
import { useMapDirty } from '../useMapDirty.js'

const savedMapConfig = {
    id: 'abc',
    name: 'My map',
    basemap: { id: 'osm', opacity: 1, isVisible: true },
    mapViews: [{ id: 'layer1', opacity: 1, isVisible: true }],
}

const renderWithStore = () => {
    const store = createStore(rootReducer)
    store.dispatch(setMap(savedMapConfig))

    const { result } = renderHook(() => useMapDirty(), {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })

    return { store, result }
}

describe('useMapDirty', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('is false right after a map is loaded', () => {
        const { result } = renderWithStore()

        act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(result.current).toBe(false)
    })

    it('becomes true after the debounce window once the map changes', () => {
        const { store, result } = renderWithStore()

        act(() => {
            store.dispatch(changeLayerOpacity('layer1', 0.5))
        })

        // Still inside the debounce window
        expect(result.current).toBe(false)

        act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(result.current).toBe(true)
    })

    it('only settles once after rapid successive changes (simulated slider drag)', () => {
        const { store, result } = renderWithStore()

        act(() => {
            for (let opacity = 0.9; opacity >= 0.5; opacity -= 0.1) {
                store.dispatch(changeLayerOpacity('layer1', opacity))
                jest.advanceTimersByTime(50) // faster than the 300ms debounce
            }
        })

        // The debounce window keeps getting reset, so it never fired yet
        expect(result.current).toBe(false)

        act(() => {
            jest.advanceTimersByTime(300)
        })

        expect(result.current).toBe(true)
    })
})
