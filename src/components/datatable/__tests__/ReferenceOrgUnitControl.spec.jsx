import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import ReferenceOrgUnitControl from '../controls/ReferenceOrgUnitControl.jsx'

const mockStore = configureMockStore()

const renderControl = (mapViews) => {
    const store = mockStore({ map: { mapViews } })
    render(
        <Provider store={store}>
            <ReferenceOrgUnitControl />
        </Provider>
    )
    return { store }
}

const click = () =>
    fireEvent.click(screen.getByTestId('data-table-reference-org-unit-button'))

describe('ReferenceOrgUnitControl', () => {
    test('opens a draft (no id) reference layer for editing when none exists yet', () => {
        const { store } = renderControl([
            { id: 'layer1', name: 'Layer 1', layer: 'thematic' },
        ])
        click()

        expect(store.getActions()).toEqual([
            {
                type: 'LAYER_EDIT',
                payload: {
                    layer: 'combinedTableRef',
                    isVisible: false,
                    rows: [],
                },
            },
        ])
    })

    test('opens the existing reference layer for editing when one already exists', () => {
        const existingReference = {
            id: 'ref1',
            layer: 'combinedTableRef',
            isVisible: false,
            rows: [{ dimension: 'ou', items: [{ id: 'country1' }] }],
        }
        const { store } = renderControl([
            { id: 'layer1', name: 'Layer 1', layer: 'thematic' },
            existingReference,
        ])
        click()

        expect(store.getActions()).toEqual([
            { type: 'LAYER_EDIT', payload: existingReference },
        ])
    })
})
