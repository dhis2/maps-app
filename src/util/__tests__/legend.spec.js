import { sortLegendItems } from '../legend.js'

describe('sortLegendItems', () => {
    test('sorts items by "from" in descending order', () => {
        const items = [
            { name: 'A', from: 10 },
            { name: 'B', from: 30 },
            { name: 'C', from: 20 },
        ]

        const sorted = sortLegendItems(items)

        expect(sorted).toEqual([
            { name: 'B', from: 30 },
            { name: 'C', from: 20 },
            { name: 'A', from: 10 },
        ])
    })

    test('sorts items by "startValue" in descending order', () => {
        const items = [
            { name: 'X', startValue: 5 },
            { name: 'Y', startValue: 15 },
            { name: 'Z', startValue: 10 },
        ]

        const sorted = sortLegendItems(items)

        expect(sorted).toEqual([
            { name: 'Y', startValue: 15 },
            { name: 'Z', startValue: 10 },
            { name: 'X', startValue: 5 },
        ])
    })

    test('returns empty array if given empty array', () => {
        const items = []
        const sorted = sortLegendItems(items)
        expect(sorted).toEqual([])
    })

    test('does not modify original array reference', () => {
        const items = [
            { name: 'A', from: 1 },
            { name: 'B', from: 2 },
        ]
        const itemsCopy = [...items]
        sortLegendItems(items)
        expect(items).not.toEqual(itemsCopy)
    })
})
