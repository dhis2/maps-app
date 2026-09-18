import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    FEATURE_HIGHLIGHT,
    ORGANISATION_UNIT_PROFILE_SET,
} from '../../../constants/actionTypes.js'
import {
    FACILITY_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../../../constants/layers.js'
import TableContextMenu from '../TableContextMenu.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: ',' },
    }),
}))

const mockStore = configureMockStore()

const layer = { id: 'layer1', layer: FACILITY_LAYER, name: 'Test layer' }
const contextMenu = { x: 10, y: 10, featureProps: {} }

const getZoomToFilteredLink = () =>
    screen
        .getByTestId('data-table-context-menu-zoom-to-filtered')
        .querySelector('a')

const renderMenu = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <TableContextMenu
                contextMenu={contextMenu}
                layer={layer}
                onClose={jest.fn()}
                {...props}
            />
        </Provider>
    )
    return { ...result, store }
}

describe('TableContextMenu — view profile menu item', () => {
    test('is not offered for a Tracked Entity row (id is a TEI uid, not an org unit id)', () => {
        renderMenu({
            layer: { id: 'layer1', layer: TRACKED_ENTITY_LAYER },
            contextMenu: { x: 10, y: 10, featureProps: { id: 'tei1' } },
        })
        expect(
            screen.queryByTestId('data-table-context-menu-view-profile')
        ).not.toBeInTheDocument()
    })

    test('dispatches setOrgUnitProfile with the row id for a layer type that supports it', () => {
        const { store } = renderMenu({
            contextMenu: { x: 10, y: 10, featureProps: { id: 'ou1' } },
        })
        fireEvent.click(
            screen
                .getByTestId('data-table-context-menu-view-profile')
                .querySelector('a')
        )
        expect(store.getActions()).toContainEqual({
            type: ORGANISATION_UNIT_PROFILE_SET,
            payload: 'ou1',
        })
    })
})

describe('TableContextMenu — zoom to filtered features', () => {
    test('is disabled when no filter is active (filteredIds is null)', () => {
        renderMenu({ filteredIds: null })
        expect(getZoomToFilteredLink()).toHaveAttribute('aria-disabled', 'true')
    })

    test('is disabled when the filtered id list is empty', () => {
        renderMenu({ filteredIds: [] })
        expect(getZoomToFilteredLink()).toHaveAttribute('aria-disabled', 'true')
    })

    test('dispatches highlightFeature with the filtered ids and closes the menu when clicked', () => {
        const onClose = jest.fn()
        const { store } = renderMenu({
            filteredIds: ['a', 'b', 'c'],
            onClose,
        })
        fireEvent.click(getZoomToFilteredLink())
        expect(store.getActions()).toContainEqual({
            type: FEATURE_HIGHLIGHT,
            payload: {
                ids: ['a', 'b', 'c'],
                layerId: 'layer1',
                origin: 'table',
                zoom: true,
            },
        })
        expect(onClose).toHaveBeenCalled()
    })
})
