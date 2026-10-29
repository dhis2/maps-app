import { getReversedSelection } from '../useRowSelection.js'

describe('getReversedSelection', () => {
    test('selects every visible row when nothing is currently selected', () => {
        expect(getReversedSelection([], ['a', 'b', 'c'])).toEqual([
            'a',
            'b',
            'c',
        ])
    })

    test('deselects every visible row when all are currently selected', () => {
        expect(getReversedSelection(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(
            []
        )
    })

    test('flips only the visible rows, keeping the rest of the selection as-is', () => {
        expect(getReversedSelection(['a'], ['a', 'b', 'c'])).toEqual(['b', 'c'])
    })

    test('preserves ids selected outside the current filtered view untouched', () => {
        // "z" was selected before a column filter narrowed the visible rows
        // down to just a/b/c - reversing must not drop it.
        expect(getReversedSelection(['a', 'z'], ['a', 'b', 'c'])).toEqual([
            'z',
            'b',
            'c',
        ])
    })
})
