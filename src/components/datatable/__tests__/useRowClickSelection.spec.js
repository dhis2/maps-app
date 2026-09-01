import { renderHook } from '@testing-library/react'
import { useRowClickSelection } from '../useRowClickSelection.js'

const row = (id) => [{ dataKey: 'id', value: id, align: 'left' }]

describe('useRowClickSelection', () => {
    test('does nothing on a plain click (no modifier)', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current(row('a'), { ctrlKey: false, shiftKey: false })

        expect(onToggle).not.toHaveBeenCalled()
        expect(onSelectRange).not.toHaveBeenCalled()
    })

    test('toggles a single row on ctrl/cmd-click', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current(row('b'), { ctrlKey: true })

        expect(onToggle).toHaveBeenCalledWith('b')
        expect(onSelectRange).not.toHaveBeenCalled()
    })

    test('selects a range on shift-click after a prior click', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c'), row('d')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current(row('a'), { ctrlKey: true })
        result.current(row('c'), { shiftKey: true })

        expect(onSelectRange).toHaveBeenCalledWith(['a', 'b', 'c'])
    })

    test('does nothing when the row has no id', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row(null)]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current(row(null), { ctrlKey: true })

        expect(onToggle).not.toHaveBeenCalled()
    })
})
