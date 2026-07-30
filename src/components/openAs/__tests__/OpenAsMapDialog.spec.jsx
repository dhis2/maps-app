import { render, waitFor, fireEvent } from '@testing-library/react'
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

const multiItemAO = {
    columns: [
        {
            dimension: 'dx',
            items: [{ id: 'dataItem1' }, { id: 'dataItem2' }],
        },
    ],
    rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

const addLayerCallsFrom = (calls) =>
    calls.filter(([action]) => action.type === types.LAYER_ADD)

describe('OpenAsMapDialog', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
    })

    it('auto-adds a single-dimension layer only once under React 18 StrictMode double-invocation', async () => {
        mockCurrentAO = singleItemAO

        // Regression (DHIS2-15762): the auto-add used to run in the render
        // body, so any extra invocation while the async add was still in
        // flight dispatched another (duplicate) layer. StrictMode
        // deliberately mount->cleanup->mounts effects in dev to surface
        // exactly this kind of bug.
        render(
            <React.StrictMode>
                <OpenAsMapDialog />
            </React.StrictMode>
        )

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: types.ANALYTICAL_OBJECT_CLEAR,
            })
        )

        const addLayerCalls = addLayerCallsFrom(mockDispatch.mock.calls)
        expect(addLayerCalls).toHaveLength(1)
        expect(addLayerCalls[0][0].payload).toEqual(
            expect.objectContaining({ layer: THEMATIC_LAYER })
        )
    })

    it('shows the picker dialog for multiple data dimensions without auto-adding a layer', () => {
        mockCurrentAO = multiItemAO

        const { getByText } = render(<OpenAsMapDialog />)

        expect(getByText('Open as map')).toBeInTheDocument()
        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('only adds one layer when Proceed is clicked twice before the add completes', async () => {
        mockCurrentAO = multiItemAO

        const { getByText } = render(<OpenAsMapDialog />)
        const proceedButton = getByText('Proceed')

        fireEvent.click(proceedButton)
        fireEvent.click(proceedButton)

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: types.ANALYTICAL_OBJECT_CLEAR,
            })
        )

        expect(addLayerCallsFrom(mockDispatch.mock.calls)).toHaveLength(1)
    })

    it('dispatches clearAnalyticalObject when Cancel is clicked', () => {
        mockCurrentAO = multiItemAO

        const { getByText } = render(<OpenAsMapDialog />)
        fireEvent.click(getByText('Cancel'))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: types.ANALYTICAL_OBJECT_CLEAR,
        })
    })
})
