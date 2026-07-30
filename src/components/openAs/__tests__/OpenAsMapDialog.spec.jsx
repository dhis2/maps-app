import { render, waitFor } from '@testing-library/react'
import React from 'react'
import * as types from '../../../constants/actionTypes.js'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import OpenAsMapDialog from '../OpenAsMapDialog.jsx'

const mockDispatch = jest.fn()
let mockCurrentAO

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
}))

jest.mock('@dhis2/app-service-datastore', () => ({
    useSetting: () => [mockCurrentAO, { set: jest.fn(), remove: jest.fn() }],
}))

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({ query: jest.fn(), mutate: jest.fn() }),
}))

// A single dx item -- the "auto-add, no dialog" path
const singleItemAO = {
    columns: [{ dimension: 'dx', items: [{ id: 'dataItem1' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

describe('OpenAsMapDialog', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
    })

    it('auto-adds a single-dimension layer only once, even across re-renders before the add completes', async () => {
        mockCurrentAO = singleItemAO
        const { rerender } = render(<OpenAsMapDialog />)

        // Regression (DHIS2-15762): the auto-add used to run in the render
        // body, so every extra re-render while the async add was still in
        // flight dispatched another (duplicate) layer.
        rerender(<OpenAsMapDialog />)
        rerender(<OpenAsMapDialog />)
        rerender(<OpenAsMapDialog />)

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: types.ANALYTICAL_OBJECT_CLEAR,
            })
        )

        const addLayerCalls = mockDispatch.mock.calls.filter(
            ([action]) => action.type === types.LAYER_ADD
        )
        expect(addLayerCalls).toHaveLength(1)
        expect(addLayerCalls[0][0].payload).toEqual(
            expect.objectContaining({ layer: THEMATIC_LAYER })
        )
    })

    it('shows the picker dialog for multiple data dimensions without auto-adding a layer', () => {
        mockCurrentAO = {
            columns: [
                {
                    dimension: 'dx',
                    items: [{ id: 'dataItem1' }, { id: 'dataItem2' }],
                },
            ],
            rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
            filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
        }

        const { getByText } = render(<OpenAsMapDialog />)

        expect(getByText('Open as map')).toBeInTheDocument()
        expect(mockDispatch).not.toHaveBeenCalled()
    })
})
