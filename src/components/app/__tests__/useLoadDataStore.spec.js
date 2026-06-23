import { renderHook, waitFor } from '@testing-library/react'
import { useLoadDataStore } from '../useLoadDataStore.js'

const mockDispatch = jest.fn()
let mockEngine

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
}))

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => mockEngine,
}))

describe('useLoadDataStore', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
        mockEngine = {
            // Namespace missing -> hook should create the key once
            query: jest.fn().mockResolvedValue({ dataStore: [] }),
            mutate: jest.fn().mockResolvedValue({}),
        }
    })

    it('queries the datastore once on mount, not on every render', async () => {
        const { rerender } = renderHook(() => useLoadDataStore())

        // Force several re-renders, as App does on any redux state change
        rerender()
        rerender()
        rerender()

        // The regression: before the fix this fired on every render.
        expect(mockEngine.query).toHaveBeenCalledTimes(1)
        expect(mockEngine.query).toHaveBeenCalledWith({
            dataStore: { resource: 'dataStore' },
        })
    })

    it('creates the namespace key exactly once and dispatches the result', async () => {
        renderHook(() => useLoadDataStore())

        await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1))

        // Only one create mutation, no flood of racing creates
        expect(mockEngine.mutate).toHaveBeenCalledTimes(1)
        expect(mockEngine.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'create' })
        )
    })
})
