import { renderHook } from '@testing-library/react'
import { useRowSelection } from '../useRowSelection.js'

describe('useRowSelection', () => {
    test('selects every visible row when nothing is selected yet', () => {
        const onChange = jest.fn()
        const { result } = renderHook(() =>
            useRowSelection({
                selectedIds: [],
                selectedIdSet: new Set(),
                allRowIds: ['a', 'b', 'c'],
                onChange,
            })
        )

        expect(result.current.isAllSelected).toBe(false)

        result.current.onToggleSelectAll()

        expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c'])
    })

    test('deselects every visible row when all are already selected', () => {
        const onChange = jest.fn()
        const { result } = renderHook(() =>
            useRowSelection({
                selectedIds: ['a', 'b', 'c'],
                selectedIdSet: new Set(['a', 'b', 'c']),
                allRowIds: ['a', 'b', 'c'],
                onChange,
            })
        )

        expect(result.current.isAllSelected).toBe(true)

        result.current.onToggleSelectAll()

        expect(onChange).toHaveBeenCalledWith([])
    })

    test('preserves ids selected outside the current view when toggling off', () => {
        const onChange = jest.fn()
        const { result } = renderHook(() =>
            useRowSelection({
                selectedIds: ['a', 'b', 'z'],
                selectedIdSet: new Set(['a', 'b', 'z']),
                allRowIds: ['a', 'b'],
                onChange,
            })
        )

        result.current.onToggleSelectAll()

        expect(onChange).toHaveBeenCalledWith(['z'])
    })

    test('reverses the visible selection via onChange', () => {
        const onChange = jest.fn()
        const { result } = renderHook(() =>
            useRowSelection({
                selectedIds: ['a'],
                selectedIdSet: new Set(['a']),
                allRowIds: ['a', 'b', 'c'],
                onChange,
            })
        )

        result.current.onReverseSelection()

        expect(onChange).toHaveBeenCalledWith(['b', 'c'])
    })
})
