import { renderHook, act } from '@testing-library/react'
import useDebouncedHighlightFeature from '../useDebouncedHighlightFeature.js'

describe('useDebouncedHighlightFeature', () => {
    const setFeatureSpy = jest.fn()

    beforeEach(() => {
        setFeatureSpy.mockClear()
    })

    it('calls setFeature immediately for a truthy payload', () => {
        const { result } = renderHook(() =>
            useDebouncedHighlightFeature(setFeatureSpy)
        )

        act(() => {
            result.current({ id: 'abc' })
        })

        expect(setFeatureSpy).toHaveBeenCalledTimes(1)
        expect(setFeatureSpy).toHaveBeenCalledWith({ id: 'abc' })
    })

    it('debounces a null payload instead of calling setFeature immediately', () => {
        jest.useFakeTimers()
        const { result } = renderHook(() =>
            useDebouncedHighlightFeature(setFeatureSpy, 100)
        )

        act(() => {
            result.current(null)
        })
        expect(setFeatureSpy).not.toHaveBeenCalled()

        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(setFeatureSpy).toHaveBeenCalledTimes(1)
        expect(setFeatureSpy).toHaveBeenCalledWith(null)

        jest.useRealTimers()
    })

    it('cancels a pending clear when a truthy payload arrives before the debounce elapses', () => {
        jest.useFakeTimers()
        const { result } = renderHook(() =>
            useDebouncedHighlightFeature(setFeatureSpy, 100)
        )

        act(() => {
            result.current(null)
            jest.advanceTimersByTime(50)
            result.current({ id: 'xyz' })
        })

        expect(setFeatureSpy).toHaveBeenCalledTimes(1)
        expect(setFeatureSpy).toHaveBeenCalledWith({ id: 'xyz' })

        act(() => {
            jest.advanceTimersByTime(100)
        })
        // The pending clear was cancelled, not just delayed further.
        expect(setFeatureSpy).toHaveBeenCalledTimes(1)

        jest.useRealTimers()
    })

    it('clears the pending timeout on unmount without calling setFeature', () => {
        jest.useFakeTimers()
        const { result, unmount } = renderHook(() =>
            useDebouncedHighlightFeature(setFeatureSpy, 100)
        )

        act(() => {
            result.current(null)
        })
        unmount()

        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(setFeatureSpy).not.toHaveBeenCalled()

        jest.useRealTimers()
    })
})
