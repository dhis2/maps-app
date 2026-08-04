import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import ResizeHandleControl from '../ResizeHandleControl.jsx'

// jsdom doesn't implement pointer capture
beforeAll(() => {
    Element.prototype.setPointerCapture = jest.fn()
    Element.prototype.releasePointerCapture = jest.fn()
})

const renderHandle = () => {
    const onResizeStart = jest.fn()
    const onResize = jest.fn()
    const onResizeEnd = jest.fn()
    const onResizeCancel = jest.fn()
    const { container } = render(
        <ResizeHandleControl
            maxHeight={500}
            minHeight={50}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
            onResizeCancel={onResizeCancel}
        />
    )
    return {
        handle: container.firstChild,
        onResizeStart,
        onResize,
        onResizeEnd,
        onResizeCancel,
    }
}

describe('ResizeHandleControl', () => {
    test('a normal drag commits a resize on pointer up', () => {
        const { handle, onResizeStart, onResize, onResizeEnd, onResizeCancel } =
            renderHandle()

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 })
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 400 })
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 300 })

        expect(onResizeStart).toHaveBeenCalledTimes(1)
        expect(onResize).toHaveBeenCalled()
        expect(onResizeEnd).toHaveBeenCalledTimes(1)
        expect(onResizeCancel).not.toHaveBeenCalled()
    })

    test('a cancelled gesture resets the drag state without committing a resize', () => {
        const { handle, onResizeEnd, onResizeCancel } = renderHandle()

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 })
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 400 })
        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 0 })

        expect(onResizeCancel).toHaveBeenCalledTimes(1)
        expect(onResizeEnd).not.toHaveBeenCalled()
    })

    test('a stray pointercancel with no active drag is a no-op', () => {
        const { handle, onResizeCancel, onResizeEnd } = renderHandle()

        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 0 })

        expect(onResizeCancel).not.toHaveBeenCalled()
        expect(onResizeEnd).not.toHaveBeenCalled()
    })

    test('a second pointer up/cancel after the drag already ended is a no-op', () => {
        const { handle, onResizeEnd, onResizeCancel } = renderHandle()

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 })
        fireEvent.pointerUp(handle, { pointerId: 1, clientY: 400 })
        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 0 })

        expect(onResizeEnd).toHaveBeenCalledTimes(1)
        expect(onResizeCancel).not.toHaveBeenCalled()
    })
})
