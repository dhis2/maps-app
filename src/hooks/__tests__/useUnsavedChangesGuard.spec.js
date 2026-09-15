import { renderHook, act, waitFor } from '@testing-library/react'
import history from '../../util/history.js'
import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard.js'

let mockMapState
let mockSavedMapState

jest.mock('query-string', () => ({
    parse: jest.fn(() => ({})),
}))

jest.mock('react-redux', () => ({
    useSelector: (selector) =>
        selector({ map: mockMapState, savedMap: mockSavedMapState }),
}))

const dirtyMap = { id: 'map1', mapViews: [{ id: 'layer1', opacity: 0.5 }] }
const savedMap = { id: 'map1', mapViews: [{ id: 'layer1', opacity: 1 }] }

describe('useUnsavedChangesGuard', () => {
    beforeEach(() => {
        mockMapState = savedMap
        mockSavedMapState = savedMap
    })

    it('isDirtyNow reflects the current map vs savedMap comparison', () => {
        mockMapState = dirtyMap
        const { result } = renderHook(() => useUnsavedChangesGuard(jest.fn()))

        expect(result.current.isDirtyNow()).toBe(true)
    })

    it('isDirtyNow is false when the map matches the saved snapshot', () => {
        const { result } = renderHook(() => useUnsavedChangesGuard(jest.fn()))

        expect(result.current.isDirtyNow()).toBe(false)
    })

    it('confirmLeave calls loadLocation with the pending location and clears it', () => {
        const loadLocation = jest.fn()
        const { result } = renderHook(() =>
            useUnsavedChangesGuard(loadLocation)
        )

        act(() => {
            result.current.setLocationToConfirm({ pathname: '/map2' })
        })
        expect(result.current.locationToConfirm).toEqual({
            pathname: '/map2',
        })

        act(() => {
            result.current.confirmLeave()
        })

        expect(loadLocation).toHaveBeenCalledWith({ pathname: '/map2' })
        expect(result.current.locationToConfirm).toBeNull()
    })

    it('confirmLeave is a no-op when there is nothing pending', () => {
        const loadLocation = jest.fn()
        const { result } = renderHook(() =>
            useUnsavedChangesGuard(loadLocation)
        )

        act(() => {
            result.current.confirmLeave()
        })

        expect(loadLocation).not.toHaveBeenCalled()
    })

    it('cancelLeave clears the pending location and navigates back', async () => {
        const { result } = renderHook(() => useUnsavedChangesGuard(jest.fn()))

        act(() => {
            history.push('/before-cancel')
            history.push('/map2')
        })
        expect(history.location.pathname).toBe('/map2')

        act(() => {
            result.current.setLocationToConfirm({ pathname: '/map2' })
        })

        act(() => {
            result.current.cancelLeave()
        })

        expect(result.current.locationToConfirm).toBeNull()
        // history.back() navigates via the browser's popstate mechanism,
        // which resolves asynchronously rather than within this act() call.
        await waitFor(() =>
            expect(history.location.pathname).toBe('/before-cancel')
        )
    })

    it('prevents the tab from closing via beforeunload when dirty', () => {
        mockMapState = dirtyMap
        renderHook(() => useUnsavedChangesGuard(jest.fn()))

        const event = new Event('beforeunload', { cancelable: true })
        act(() => {
            window.dispatchEvent(event)
        })

        expect(event.defaultPrevented).toBe(true)
    })

    it('does not block beforeunload when not dirty', () => {
        renderHook(() => useUnsavedChangesGuard(jest.fn()))

        const event = new Event('beforeunload', { cancelable: true })
        act(() => {
            window.dispatchEvent(event)
        })

        expect(event.defaultPrevented).toBe(false)
    })
})
