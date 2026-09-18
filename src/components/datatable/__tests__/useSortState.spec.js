import { act, renderHook } from '@testing-library/react'
import { useSortState } from '../useSortState.js'

describe('useSortState', () => {
    test('starts sorted by the initial field, ascending - matching what the table shows before any interaction', () => {
        const { result } = renderHook(() => useSortState('name'))

        expect(result.current.sortField).toBe('name')
        expect(result.current.sortDirection).toBe('asc')
    })

    test('cycling a different column 3 times returns to the same field/direction the table started with - not an unsorted state', () => {
        const { result } = renderHook(() => useSortState('name'))

        act(() => result.current.sortData({ name: 'type' }))
        expect(result.current).toMatchObject({
            sortField: 'type',
            sortDirection: 'asc',
        })

        act(() => result.current.sortData({ name: 'type' }))
        expect(result.current).toMatchObject({
            sortField: 'type',
            sortDirection: 'desc',
        })

        act(() => result.current.sortData({ name: 'type' }))
        expect(result.current).toMatchObject({
            sortField: 'name',
            sortDirection: 'asc',
        })
    })

    test('cycling the initial/default column itself is a 2-state toggle, since it already is the default', () => {
        const { result } = renderHook(() => useSortState('name'))

        act(() => result.current.sortData({ name: 'name' }))
        expect(result.current).toMatchObject({
            sortField: 'name',
            sortDirection: 'desc',
        })

        act(() => result.current.sortData({ name: 'name' }))
        expect(result.current).toMatchObject({
            sortField: 'name',
            sortDirection: 'asc',
        })
    })

    test('respects a custom initial sort field as the reset target', () => {
        const { result } = renderHook(() => useSortState('level'))

        act(() => result.current.sortData({ name: 'name' }))
        act(() => result.current.sortData({ name: 'name' }))
        act(() => result.current.sortData({ name: 'name' }))

        expect(result.current).toMatchObject({
            sortField: 'level',
            sortDirection: 'asc',
        })
    })
})
