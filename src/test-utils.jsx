import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

// Shared rendering helpers for component/hook tests. Not covered here (need a
// different approach - see the components-testing plan for what's next):
// - map/layers/* class components read legacy this.context.isPlugin/this.context.map,
//   which needs a legacy-context wrapper, not these helpers.
// - @dnd-kit-based components (e.g. layers/LayersPanel.jsx) need dnd-kit's own test
//   utilities for drag simulation.

const mockStore = configureMockStore()

// Renders `ui` wrapped in a react-redux <Provider>. Pass `store` to reuse an
// existing mock store (e.g. to assert dispatched actions via store.getActions()),
// or `initialState` to have one created for you.
export const renderWithRedux = (
    ui,
    { initialState = {}, store, ...options } = {}
) => {
    const usedStore = store || mockStore(initialState)

    return {
        store: usedStore,
        ...render(<Provider store={usedStore}>{ui}</Provider>, options),
    }
}

// Builds a `useCachedData()` return value with sensible defaults. Jest hoists
// jest.mock(...) calls above imports within a module, so mocking
// CachedDataProvider.jsx has to stay a `jest.mock(...)` call at the top of each
// spec file - it can't be done from inside this helper. This factory just keeps
// the mocked shape consistent across specs, e.g.:
//   jest.mock('.../CachedDataProvider.jsx', () => ({
//       useCachedData: () => mockCachedData({ basemaps: [...] }),
//   }))
// The real CachedDataProvider context carries more fields than the two
// defaulted below (e.g. nameProperty). Pass overrides for whatever a given
// spec needs - a field left out here and not overridden reads as undefined,
// not a helpful error.
export const mockCachedData = (overrides = {}) => ({
    systemSettings: {},
    basemaps: [],
    ...overrides,
})

// No Provider wrapping is needed for cached-data-only components (the mock
// above fully intercepts useCachedData at the module level), so this is a thin
// passthrough - kept for a consistent renderWith* naming convention alongside
// renderWithRedux.
export const renderWithCachedData = (ui, options) => render(ui, options)
