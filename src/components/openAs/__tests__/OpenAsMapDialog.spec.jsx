import { render, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import * as types from '../../../constants/actionTypes.js'
import {
    THEMATIC_LAYER,
    EARTH_ENGINE_LAYER,
} from '../../../constants/layers.js'
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
    columns: [
        { dimension: 'dx', items: [{ id: 'dataItem1', name: 'Data item 1' }] },
    ],
    rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

const multiItemAO = {
    columns: [
        {
            dimension: 'dx',
            items: [
                { id: 'dataItem1', name: 'Data item 1' },
                { id: 'dataItem2', name: 'Data item 2' },
            ],
        },
    ],
    rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

// Earth Engine periods are nested one level deeper than thematic ones
const earthEngineAO = {
    type: EARTH_ENGINE_LAYER,
    layerId: 'USGS/SRTMGL1_003',
    rows: [{ dimension: 'ou', items: [{ id: 'O6uvpzGd5pu' }] }],
    filters: [{ dimension: 'pe', items: [[{ id: '20250107' }]] }],
}

const addLayerCallsFrom = (calls) =>
    calls.filter(([action]) => action.type === types.LAYER_ADD)

const waitForClear = () =>
    waitFor(() =>
        expect(mockDispatch).toHaveBeenCalledWith({
            type: types.ANALYTICAL_OBJECT_CLEAR,
        })
    )

describe('OpenAsMapDialog', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
    })

    // Regression test for DHIS2-15762: the auto-add used to run in the render
    // body, so an extra invocation while it was in flight added a second layer.
    // StrictMode double-invokes render and effects to surface exactly this.
    it('auto-adds a single-dimension layer only once under StrictMode', async () => {
        mockCurrentAO = singleItemAO

        render(
            <React.StrictMode>
                <OpenAsMapDialog />
            </React.StrictMode>
        )

        await waitForClear()

        const addLayerCalls = addLayerCallsFrom(mockDispatch.mock.calls)
        expect(addLayerCalls).toHaveLength(1)
        expect(addLayerCalls[0][0].payload).toEqual(
            expect.objectContaining({ layer: THEMATIC_LAYER })
        )
    })

    // The last data item in the loop compared an id against a dimension object,
    // so every auto-added layer used to be added switched off
    it('adds the auto-added layer as visible', async () => {
        mockCurrentAO = singleItemAO

        render(<OpenAsMapDialog />)
        await waitForClear()

        const [[action]] = addLayerCallsFrom(mockDispatch.mock.calls)
        expect(action.payload.isVisible).toBe(true)
    })

    it('auto-adds an earth engine layer only once under StrictMode', async () => {
        mockCurrentAO = earthEngineAO

        render(
            <React.StrictMode>
                <OpenAsMapDialog />
            </React.StrictMode>
        )

        await waitForClear()

        const addLayerCalls = addLayerCallsFrom(mockDispatch.mock.calls)
        expect(addLayerCalls).toHaveLength(1)
        expect(addLayerCalls[0][0].payload).toEqual(
            expect.objectContaining({
                layer: EARTH_ENGINE_LAYER,
                layerId: 'USGS/SRTMGL1_003',
                isVisible: true,
            })
        )
    })

    it('clears the analytical object when the earth engine layer id is unknown', async () => {
        mockCurrentAO = { ...earthEngineAO, layerId: 'no/such/layer' }

        render(<OpenAsMapDialog />)
        await waitForClear()

        expect(addLayerCallsFrom(mockDispatch.mock.calls)).toHaveLength(0)
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

        await waitForClear()

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
