import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { LAYER_UPDATE } from '../../../constants/actionTypes.js'
import { drillUpDown } from '../../../util/map.js'
import ContextMenu from '../ContextMenu.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: jest.fn(() => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'NONE' },
    })),
}))

const mockStore = configureMockStore()

const storedLayer = {
    id: 'layer1',
    layer: 'thematic',
    name: 'ANC 1 Coverage',
    rows: [{ dimension: 'ou', items: [{ id: 'LEVEL-2' }] }],
}

const feature = {
    properties: {
        id: 'kono',
        level: '2',
        parentGraph: 'sierraLeone',
        grandParentId: 'sierraLeone',
        grandParentParentGraph: '',
        hasCoordinatesUp: true,
        hasCoordinatesDown: true,
    },
}

const renderMenu = () => {
    const store = mockStore({
        contextMenu: {
            layerId: 'layer1',
            layerType: 'thematic',
            feature,
            position: [10, 10],
            offset: [0, 0],
        },
        map: { mapViews: [storedLayer] },
    })

    render(
        <Provider store={store}>
            <ContextMenu />
        </Provider>
    )

    return store
}

describe('ContextMenu', () => {
    test('drilling down saves the stored layer with the clicked org unit', async () => {
        const store = renderMenu()

        fireEvent.click(await screen.findByText('Drill down one level'))

        expect(store.getActions()).toContainEqual({
            type: LAYER_UPDATE,
            payload: drillUpDown(storedLayer, 'kono', 'sierraLeone', 3),
        })
    })

    test('drilling up saves the stored layer with the parent org unit', async () => {
        const store = renderMenu()

        fireEvent.click(await screen.findByText('Drill up one level'))

        expect(store.getActions()).toContainEqual({
            type: LAYER_UPDATE,
            payload: drillUpDown(storedLayer, 'sierraLeone', '', 1),
        })
    })
})
