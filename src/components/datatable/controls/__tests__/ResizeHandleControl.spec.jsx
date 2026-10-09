import { render, fireEvent, createEvent } from '@testing-library/react'
import React from 'react'
import ResizeHandleControl from '../ResizeHandleControl.jsx'

// jsdom's fireEvent.pointer*() doesn't set clientY/pointerId (no native
// PointerEvent support), so build the events manually and patch them on
beforeAll(() => {
    Element.prototype.setPointerCapture = jest.fn()
    Element.prototype.releasePointerCapture = jest.fn()
})

const firePointerEvent = (type, element, { clientY, pointerId = 1 }) => {
    const event = createEvent[type](element)
    Object.defineProperty(event, 'clientY', { value: clientY })
    Object.defineProperty(event, 'pointerId', { value: pointerId })
    fireEvent(element, event)
}

const renderHandle = (props = {}) => {
    const onResize = jest.fn()
    const onResizeStart = jest.fn()
    const onResizeEnd = jest.fn()
    const { container } = render(
        <ResizeHandleControl
            maxHeight={500}
            onResize={onResize}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            {...props}
        />
    )
    return {
        handle: container.firstChild,
        onResize,
        onResizeStart,
        onResizeEnd,
    }
}

describe('ResizeHandleControl', () => {
    it('does not resize on a plain click with no pointer movement', () => {
        const { handle, onResize, onResizeStart, onResizeEnd } = renderHandle()

        firePointerEvent('pointerDown', handle, { clientY: 300 })
        firePointerEvent('pointerUp', handle, { clientY: 300 })

        expect(onResizeStart).not.toHaveBeenCalled()
        expect(onResize).not.toHaveBeenCalled()
        expect(onResizeEnd).not.toHaveBeenCalled()
    })

    it('does not resize when movement stays under the drag threshold', () => {
        const { handle, onResize, onResizeStart, onResizeEnd } = renderHandle()

        firePointerEvent('pointerDown', handle, { clientY: 300 })
        firePointerEvent('pointerMove', handle, { clientY: 301 })
        firePointerEvent('pointerUp', handle, { clientY: 301 })

        expect(onResizeStart).not.toHaveBeenCalled()
        expect(onResize).not.toHaveBeenCalled()
        expect(onResizeEnd).not.toHaveBeenCalled()
    })

    it('resizes once the pointer moves past the drag threshold', () => {
        const { handle, onResize, onResizeStart, onResizeEnd } = renderHandle()

        firePointerEvent('pointerDown', handle, { clientY: 300 })
        firePointerEvent('pointerMove', handle, { clientY: 280 })
        firePointerEvent('pointerUp', handle, { clientY: 280 })

        expect(onResizeStart).toHaveBeenCalledTimes(1)
        expect(onResize).toHaveBeenCalled()
        expect(onResizeEnd).toHaveBeenCalledTimes(1)
    })
})
