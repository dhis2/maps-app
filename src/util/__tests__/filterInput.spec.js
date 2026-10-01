import {
    getDisplayValue,
    getFilteredOptions,
    getPopoverWidth,
    getSelectedAndAppliedString,
    measureMaxTextWidth,
} from '../filterInput.js'

describe('getSelectedAndAppliedString', () => {
    it('treats an array filterValue as the selected checkboxes', () => {
        expect(getSelectedAndAppliedString(['a', 'b'])).toEqual({
            selected: ['a', 'b'],
            appliedString: '',
        })
    })

    it('treats a string filterValue as an applied custom filter', () => {
        expect(getSelectedAndAppliedString('> 5')).toEqual({
            selected: [],
            appliedString: '> 5',
        })
    })

    it('returns empty defaults when there is no filterValue yet', () => {
        expect(getSelectedAndAppliedString(undefined)).toEqual({
            selected: [],
            appliedString: '',
        })
    })
})

describe('getDisplayValue', () => {
    it('shows the live search text while the popover is open, regardless of other state', () => {
        expect(
            getDisplayValue({
                isOpen: true,
                searchText: 'typing…',
                selected: ['a'],
                appliedString: '> 5',
            })
        ).toBe('typing…')
    })

    it('shows a selection count when closed with checkboxes selected', () => {
        expect(
            getDisplayValue({
                isOpen: false,
                searchText: '',
                selected: ['a', 'b'],
                appliedString: '',
            })
        ).toBe('2 selected')
    })

    it('falls back to the applied custom filter string when closed with nothing selected', () => {
        expect(
            getDisplayValue({
                isOpen: false,
                searchText: '',
                selected: [],
                appliedString: '> 5',
            })
        ).toBe('> 5')
    })
})

describe('getFilteredOptions', () => {
    const realOptions = [{ value: '3' }, { value: '7' }, { value: '12' }]

    it('returns every option unchanged when there is no search text', () => {
        expect(
            getFilteredOptions({
                realOptions,
                trimmedSearch: '',
                normalizedSearch: '',
                type: 'number',
                resolveLabel: (v) => v,
            })
        ).toBe(realOptions)
    })

    it('filters numeric columns using the typed filter expression, not substring match', () => {
        const result = getFilteredOptions({
            realOptions,
            trimmedSearch: '> 5',
            normalizedSearch: '> 5',
            type: 'number',
            resolveLabel: (v) => v,
        })
        expect(result.map((o) => o.value)).toEqual(['7', '12'])
    })

    it('filters string columns by case-insensitive substring match on the resolved label', () => {
        const stringOptions = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]
        const resolveLabel = (v) =>
            ({ a: 'Apple', b: 'Banana', c: 'Cherry' }[v])
        const result = getFilteredOptions({
            realOptions: stringOptions,
            trimmedSearch: 'AN',
            normalizedSearch: 'an',
            type: 'string',
            resolveLabel,
        })
        expect(result.map((o) => o.value)).toEqual(['b'])
    })
})

describe('measureMaxTextWidth', () => {
    it('returns the width of the longest of several strings', () => {
        const font = '11px sans-serif'
        const short = measureMaxTextWidth(['a'], font)
        const long = measureMaxTextWidth(['a much longer piece of text'], font)
        const max = measureMaxTextWidth(
            ['a', 'a much longer piece of text'],
            font
        )
        expect(max).toBe(long)
        expect(long).toBeGreaterThan(short)
    })

    it('returns 0 for an empty list of strings', () => {
        expect(measureMaxTextWidth([], '11px sans-serif')).toBe(0)
    })
})

describe('getPopoverWidth', () => {
    it('clamps up to the minimum width for a small measured label', () => {
        expect(getPopoverWidth(1)).toBe(140)
    })

    it('clamps down to the maximum width for a very wide measured label', () => {
        expect(getPopoverWidth(1000)).toBe(280)
    })

    it('passes a mid-range measurement through with the non-label width added', () => {
        expect(getPopoverWidth(100)).toBe(156)
    })
})
