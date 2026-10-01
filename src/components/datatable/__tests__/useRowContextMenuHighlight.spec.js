import { renderHook } from '@testing-library/react'
import { useRowContextMenuHighlight } from '../useRowContextMenuHighlight.js'

const leaveEvent = (relatedTagName) => ({
    relatedTarget: relatedTagName ? { tagName: relatedTagName } : null,
})

describe('useRowContextMenuHighlight', () => {
    test('opening the context menu pins the row via onPin', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )
        const row = { id: 'row1' }

        result.current.onContextMenuOpen(row)

        expect(onPin).toHaveBeenCalledWith(row)
    })

    test('a mouseleave while the menu is open is ignored, even when it would normally clear the highlight', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.onContextMenuOpen({ id: 'row1' })
        result.current.guardedClear(leaveEvent('DIV'))

        expect(onClear).not.toHaveBeenCalled()
    })

    test('mouseleave clears the highlight normally when no menu is open', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.guardedClear(leaveEvent('DIV'))

        expect(onClear).toHaveBeenCalledTimes(1)
    })

    test('mouseleave between cells of the same row (relatedTarget is a TD) still never clears, menu or no menu', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.guardedClear(leaveEvent('TD'))

        expect(onClear).not.toHaveBeenCalled()
    })

    test('closing the menu without a superseding highlight clears it', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.onContextMenuOpen({ id: 'row1' })
        result.current.onMenuClose(false)

        expect(onClear).toHaveBeenCalledTimes(1)
    })

    test('closing the menu after a "Zoom to ..." action (highlightChanged=true) preserves the new highlight', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.onContextMenuOpen({ id: 'row1' })
        result.current.onMenuClose(true)

        expect(onClear).not.toHaveBeenCalled()
    })

    test('after the menu closes, mouseleave clearing resumes normally', () => {
        const onPin = jest.fn()
        const onClear = jest.fn()
        const { result } = renderHook(() =>
            useRowContextMenuHighlight({ onPin, onClear })
        )

        result.current.onContextMenuOpen({ id: 'row1' })
        result.current.onMenuClose(true)
        result.current.guardedClear(leaveEvent('DIV'))

        expect(onClear).toHaveBeenCalledTimes(1)
    })
})
