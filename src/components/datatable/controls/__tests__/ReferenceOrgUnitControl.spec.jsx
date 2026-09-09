import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { createStore } from 'redux'
import { toggleCombinedView } from '../../../../actions/dataTable.js'
import { COMBINED_TABLE_REF_LAYER } from '../../../../constants/layers.js'
import rootReducer from '../../../../reducers/index.js'
import { useReferenceLayer } from '../ReferenceOrgUnitControl.jsx'

const SelectCombinedHarness = () => {
    const dispatch = useDispatch()
    const { openReferenceLayerEditor } = useReferenceLayer()

    return (
        <button
            onClick={() => {
                dispatch(toggleCombinedView())
                openReferenceLayerEditor()
            }}
        >
            Select Combined
        </button>
    )
}

describe('useReferenceLayer', () => {
    test('opens the editor for the placeholder reference layer just created by toggleCombinedView, not a second orphaned one', () => {
        const store = createStore(rootReducer)

        render(
            <Provider store={store}>
                <SelectCombinedHarness />
            </Provider>
        )

        fireEvent.click(screen.getByText('Select Combined'))

        const referenceLayers = store
            .getState()
            .map.mapViews.filter((l) => l.layer === COMBINED_TABLE_REF_LAYER)

        expect(referenceLayers).toHaveLength(1)
        expect(referenceLayers[0].id).toBeDefined()
        expect(store.getState().layerEdit.id).toBe(referenceLayers[0].id)
    })
})
