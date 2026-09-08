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

        result.current.onRowClick(row('a'), { ctrlKey: false, shiftKey: false })

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

        result.current.onRowClick(row('b'), { ctrlKey: true })

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

        result.current.onRowClick(row('a'), { ctrlKey: true })
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onSelectRange).toHaveBeenCalledWith(['a', 'b', 'c'])
    })

    test('shift-click with no prior anchor selects (never toggles) just that row', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current.onRowClick(row('b'), { shiftKey: true })

        expect(onToggle).not.toHaveBeenCalled()
        expect(onSelectRange).toHaveBeenCalledWith(['b'])
    })

    test('a shift-click range keeps the anchor fixed, so a following shift-click recomputes from the same anchor', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current.onRowClick(row('a'), { ctrlKey: true }) // anchor = a
        result.current.onRowClick(row('c'), { shiftKey: true }) // range a-c, anchor stays a
        result.current.onRowClick(row('b'), { shiftKey: true }) // range a-b, not c-b

        expect(onSelectRange).toHaveBeenNthCalledWith(1, ['a', 'b', 'c'])
        expect(onSelectRange).toHaveBeenNthCalledWith(2, ['a', 'b'])
    })

    test('does nothing when the row has no id', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row(null)]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current.onRowClick(row(null), { ctrlKey: true })

        expect(onToggle).not.toHaveBeenCalled()
    })

    test('a ctrl-click that selects a row anchors it for a following shift-click', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const selectedIdSet = new Set()
        const { result } = renderHook(() =>
            useRowClickSelection({
                rows,
                onToggle,
                onSelectRange,
                selectedIdSet,
            })
        )

        result.current.onRowClick(row('a'), { ctrlKey: true }) // selects a, anchor = a
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onSelectRange).toHaveBeenCalledWith(['a', 'b', 'c'])
    })

    test('a ctrl-click that deselects a row clears the anchor, so a following shift-click selects just that row', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const selectedIdSet = new Set(['a'])
        const { result } = renderHook(() =>
            useRowClickSelection({
                rows,
                onToggle,
                onSelectRange,
                selectedIdSet,
            })
        )

        result.current.onRowClick(row('a'), { ctrlKey: true }) // deselects a, anchor cleared
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onToggle).toHaveBeenCalledWith('a')
        expect(onSelectRange).toHaveBeenCalledWith(['c'])
    })

    test('shift-clicking a checkbox selects the range from the anchor, same as shift-clicking the row', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c'), row('d')]
        const selectedIdSet = new Set()
        const { result } = renderHook(() =>
            useRowClickSelection({
                rows,
                onToggle,
                onSelectRange,
                selectedIdSet,
            })
        )

        result.current.onCheckboxToggle('a') // anchor = a
        result.current.onCheckboxToggle('c', { shiftKey: true })

        expect(onSelectRange).toHaveBeenCalledWith(['a', 'b', 'c'])
        expect(onToggle).toHaveBeenCalledTimes(1)
        expect(onToggle).toHaveBeenCalledWith('a')
    })

    test('shift-clicking a checkbox with no prior anchor selects just that row', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current.onCheckboxToggle('b', { shiftKey: true })

        expect(onToggle).not.toHaveBeenCalled()
        expect(onSelectRange).toHaveBeenCalledWith(['b'])
    })

    test('checking a row via the checkbox anchors it for a following shift-click, same as ctrl-click', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const selectedIdSet = new Set()
        const { result } = renderHook(() =>
            useRowClickSelection({
                rows,
                onToggle,
                onSelectRange,
                selectedIdSet,
            })
        )

        result.current.onCheckboxToggle('a')
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onToggle).toHaveBeenCalledWith('a')
        expect(onSelectRange).toHaveBeenCalledWith(['a', 'b', 'c'])
    })

    test('unchecking a row via the checkbox clears the anchor, same as ctrl-click', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const selectedIdSet = new Set(['a'])
        const { result } = renderHook(() =>
            useRowClickSelection({
                rows,
                onToggle,
                onSelectRange,
                selectedIdSet,
            })
        )

        result.current.onCheckboxToggle('a')
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onToggle).toHaveBeenCalledWith('a')
        expect(onSelectRange).toHaveBeenCalledWith(['c'])
    })

    test('resetAnchor clears the anchor, so a following shift-click selects just that row', () => {
        const onToggle = jest.fn()
        const onSelectRange = jest.fn()
        const rows = [row('a'), row('b'), row('c')]
        const { result } = renderHook(() =>
            useRowClickSelection({ rows, onToggle, onSelectRange })
        )

        result.current.onRowClick(row('a'), { ctrlKey: true }) // anchor = a
        result.current.resetAnchor()
        result.current.onRowClick(row('c'), { shiftKey: true })

        expect(onSelectRange).toHaveBeenLastCalledWith(['c'])
    })
})
