import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
} from '../../constants/dataTable.js'
import {
    getInvertibleValues,
    reverseSelection,
    toggleAnyValue,
    toggleRealValue,
} from '../filterSelection.js'

describe('getInvertibleValues', () => {
    it('includes the "No value" sentinel ahead of the real values when the column has blank cells', () => {
        expect(getInvertibleValues(true, ['High', 'Low'])).toEqual([
            SENTINEL_NO_VALUE,
            'High',
            'Low',
        ])
    })

    it('omits the sentinel entirely when the column has no blank cells', () => {
        expect(getInvertibleValues(false, ['High', 'Low'])).toEqual([
            'High',
            'Low',
        ])
    })
})

describe('toggleAnyValue', () => {
    it('activates "Any value" alone from an empty selection', () => {
        expect(toggleAnyValue([])).toEqual([SENTINEL_ANY_VALUE])
    })

    it('activates "Any value" while preserving an already-set "No value"', () => {
        expect(toggleAnyValue([SENTINEL_NO_VALUE])).toEqual([
            SENTINEL_ANY_VALUE,
            SENTINEL_NO_VALUE,
        ])
    })

    it('clears everything when deactivating "Any value" with "No value" unset', () => {
        expect(toggleAnyValue([SENTINEL_ANY_VALUE])).toEqual([])
    })

    it('deactivating "Any value" preserves "No value" independently', () => {
        expect(toggleAnyValue([SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE])).toEqual(
            [SENTINEL_NO_VALUE]
        )
    })
})

describe('toggleRealValue', () => {
    const realValues = ['High', 'Medium', 'Low']

    it('adds a value to the selection', () => {
        expect(toggleRealValue(['High'], 'Low', realValues)).toEqual([
            'High',
            'Low',
        ])
    })

    it('removes an already-selected value', () => {
        expect(toggleRealValue(['High', 'Low'], 'Low', realValues)).toEqual([
            'High',
        ])
    })

    it('collapses to "Any value" once every real value ends up checked', () => {
        expect(toggleRealValue(['High', 'Medium'], 'Low', realValues)).toEqual([
            SENTINEL_ANY_VALUE,
        ])
    })

    it('collapsing to "Any value" preserves "No value" if it was set', () => {
        expect(
            toggleRealValue(
                ['High', 'Medium', SENTINEL_NO_VALUE],
                'Low',
                realValues
            )
        ).toEqual([SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE])
    })

    it('unticking one real value while "Any value" is active splits it back into an explicit list', () => {
        expect(
            toggleRealValue([SENTINEL_ANY_VALUE], 'Medium', realValues)
        ).toEqual(['High', 'Low'])
    })

    it('unticking a real value while "Any value" is active preserves "No value" if it was set', () => {
        expect(
            toggleRealValue(
                [SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE],
                'Medium',
                realValues
            )
        ).toEqual(['High', 'Low', SENTINEL_NO_VALUE])
    })
})

describe('reverseSelection', () => {
    const realValues = ['High', 'Medium', 'Low']

    it('selects "Any value" when nothing is currently selected', () => {
        expect(reverseSelection([], realValues, false)).toEqual([
            SENTINEL_ANY_VALUE,
        ])
    })

    it("flips each value's checked state relative to the current selection", () => {
        expect(reverseSelection(['High'], realValues, false)).toEqual([
            'Medium',
            'Low',
        ])
    })

    it('includes "No value" in the values it flips', () => {
        expect(
            reverseSelection(['Country'], ['Country', 'District'], true)
        ).toEqual([SENTINEL_NO_VALUE, 'District'])
    })

    it('collapses to "Any value" (plus "No value" if that was unset) when reversing ends up ticking every real value', () => {
        expect(reverseSelection([], ['Country'], true)).toEqual([
            SENTINEL_ANY_VALUE,
            SENTINEL_NO_VALUE,
        ])
    })

    it('clears everything when reversing turns off an active "Any value" (there is no way to represent "all unticked" while it stays on)', () => {
        expect(
            reverseSelection(['High', SENTINEL_ANY_VALUE], realValues, false)
        ).toEqual([])
    })

    it('reversing while "Any value" is active flips "No value" independently, since it is unaffected by "Any value"', () => {
        expect(
            reverseSelection([SENTINEL_ANY_VALUE], ['Country'], true)
        ).toEqual([SENTINEL_NO_VALUE])
    })

    it('is a no-op array when there are no invertible values', () => {
        expect(reverseSelection([], [], false)).toEqual([])
    })
})
