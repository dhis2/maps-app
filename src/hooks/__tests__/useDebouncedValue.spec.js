import { renderHook, act } from '@testing-library/react'
import useDebouncedValue from '../useDebouncedValue.js'

describe('useDebouncedValue', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebouncedValue('a', 100))
        expect(result.current).toBe('a')
    })

    it('does not update until the debounce elapses', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 100),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'ab' })
        expect(result.current).toBe('a')

        act(() => {
            jest.advanceTimersByTime(100)
        })
        expect(result.current).toBe('ab')
    })

    it('resets the timer on each change, only settling on the last value', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 100),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'ab' })
        act(() => {
            jest.advanceTimersByTime(50)
        })
        rerender({ value: 'abc' })
        act(() => {
            jest.advanceTimersByTime(50)
        })
        // The first change's timeout never reached 100ms uninterrupted
        expect(result.current).toBe('a')

        act(() => {
            jest.advanceTimersByTime(50)
        })
        expect(result.current).toBe('abc')
    })

    it('clears the pending timeout on unmount', () => {
        const { rerender, unmount } = renderHook(
            ({ value }) => useDebouncedValue(value, 100),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'ab' })
        unmount()

        expect(() => {
            act(() => {
                jest.advanceTimersByTime(100)
            })
        }).not.toThrow()
    })
})
