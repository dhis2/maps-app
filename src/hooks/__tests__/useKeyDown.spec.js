import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'
import useKeyDown from '../useKeyDown.js'

describe('useKeyDown', () => {
    const callbackSpy = jest.fn()

    beforeEach(() => {
        callbackSpy.mockClear()
    })

    it('should call the callback when the specified key is pressed', () => {
        const { unmount } = renderHook(() =>
            useKeyDown('a', callbackSpy, false)
        )

        act(() => {
            const keyDownEvent = new KeyboardEvent('keydown', { key: 'a' })
            window.dispatchEvent(keyDownEvent)
        })

        expect(callbackSpy).toHaveBeenCalledTimes(1)
        expect(callbackSpy).toHaveBeenCalledWith(expect.any(Object))

        unmount()
    })

    it('should call the callback for any key in the array', () => {
        const { unmount } = renderHook(() =>
            useKeyDown(['a', 'b'], callbackSpy, false)
        )

        act(() => {
            const keyDownEventA = new KeyboardEvent('keydown', { key: 'a' })
            const keyDownEventB = new KeyboardEvent('keydown', { key: 'b' })
            window.dispatchEvent(keyDownEventA)
            window.dispatchEvent(keyDownEventB)
        })

        expect(callbackSpy).toHaveBeenCalledTimes(2)

        unmount()
    })

    it('should not call the callback for a key not in the list', () => {
        const { unmount } = renderHook(() =>
            useKeyDown(['a', 'b'], callbackSpy, false)
        )

        act(() => {
            const keyDownEvent = new KeyboardEvent('keydown', { key: 'c' })
            window.dispatchEvent(keyDownEvent)
        })

        expect(callbackSpy).not.toHaveBeenCalled()

        unmount()
    })

    it('should handle long press and call the callback after the delay', () => {
        jest.useFakeTimers()

        const { unmount } = renderHook(() => useKeyDown('a', callbackSpy, true))

        act(() => {
            const keyDownEvent = new KeyboardEvent('keydown', { key: 'a' })
            window.dispatchEvent(keyDownEvent)

            jest.advanceTimersByTime(250) // Simulate delay
        })

        expect(callbackSpy).toHaveBeenCalledTimes(1)

        unmount()
        jest.useRealTimers()
    })

    it('should clear the timeout if the key is released before the delay', () => {
        jest.useFakeTimers()

        const { unmount } = renderHook(() => useKeyDown('a', callbackSpy, true))

        act(() => {
            const keyDownEvent = new KeyboardEvent('keydown', { key: 'a' })
            const keyUpEvent = new KeyboardEvent('keyup', { key: 'a' })

            window.dispatchEvent(keyDownEvent)
            window.dispatchEvent(keyUpEvent)

            jest.advanceTimersByTime(250) // Simulate delay
        })

        expect(callbackSpy).not.toHaveBeenCalled()

        unmount()
        jest.useRealTimers()
    })
})
