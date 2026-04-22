import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_STANDARD_DEVIATION,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_PRETTY_BREAKS,
} from '../../constants/layers.js'
import { getLegendItemForValue, getLegendItems } from '../classify.js'

jest.mock('d3-format', () => ({
    precisionRound: jest.fn(() => 2),
}))

jest.mock('../helpers.js', () => ({
    hasValue: jest.fn((v) => v !== null && v !== undefined),
}))

jest.mock('../numbers.js', () => ({
    getRoundToPrecisionFn: jest.fn(() => (val) => Number(val.toFixed(2))),
}))

describe('getLegendItemForValue', () => {
    const legendItems = [
        { startValue: 0, endValue: 10 },
        { startValue: 10, endValue: 20 },
        { startValue: 20, endValue: 30 },
    ]
    const clamp = true

    it('returns undefined if value is null', () => {
        expect(
            getLegendItemForValue({ value: null, legendItems })
        ).toBeUndefined()
    })

    it('returns undefined if legendItems is empty', () => {
        expect(
            getLegendItemForValue({ value: 5, legendItems: [] })
        ).toBeUndefined()
    })

    it('returns correct item for value in range', () => {
        expect(getLegendItemForValue({ value: 15, legendItems })).toEqual(
            legendItems[1]
        )
    })

    it('returns last bin if value equals last bin end', () => {
        expect(getLegendItemForValue({ value: 30, legendItems })).toEqual(
            legendItems[2]
        )
    })

    it('returns clamped first bin if value is below range', () => {
        expect(
            getLegendItemForValue({ value: -5, legendItems, clamp })
        ).toEqual(legendItems[0])
    })

    it('returns clamped last bin if value is above range', () => {
        expect(
            getLegendItemForValue({ value: 100, legendItems, clamp })
        ).toEqual(legendItems[2])
    })

    it('returns undefined if unclamped value is out of range', () => {
        expect(
            getLegendItemForValue({ value: -1, legendItems })
        ).toBeUndefined()
    })

    it('does not clamp values below isolated value to the isolated item', () => {
        const isolatedItem = {
            startValue: 15,
            endValue: 15,
            isLegendIsolated: true,
        }
        const itemsWithIsolated = [isolatedItem, ...legendItems]
        // value=5 is below isolated=15 but should map to legendItems[0], not isolated
        expect(
            getLegendItemForValue({
                value: 5,
                legendItems: itemsWithIsolated,
                clamp: true,
            })
        ).toEqual(legendItems[0])
    })

    it('returns isolated item when isolated value is the minimum', () => {
        const isolatedItem = {
            startValue: 0,
            endValue: 0,
            isLegendIsolated: true,
        }
        const rangeItems = [
            { startValue: 1, endValue: 15 },
            { startValue: 15, endValue: 30 },
        ]
        expect(
            getLegendItemForValue({
                value: 0,
                legendItems: [isolatedItem, ...rangeItems],
                clamp: true,
            })
        ).toEqual(isolatedItem)
    })

    it('returns isolated item when isolated value is the maximum', () => {
        const isolatedItem = {
            startValue: 30,
            endValue: 30,
            isLegendIsolated: true,
        }
        const rangeItems = [
            { startValue: 0, endValue: 15 },
            { startValue: 15, endValue: 29 },
        ]
        expect(
            getLegendItemForValue({
                value: 30,
                legendItems: [isolatedItem, ...rangeItems],
                clamp: true,
            })
        ).toEqual(isolatedItem)
    })
})

describe('getLegendItems', () => {
    it('returns equal intervals for CLASSIFICATION_EQUAL_INTERVALS', () => {
        const values = [0, 100]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_EQUAL_INTERVALS,
            {
                numClasses: 4,
            }
        )
        expect(items).toEqual([
            { startValue: 0.0, endValue: 25.0 },
            { startValue: 25.0, endValue: 50.0 },
            { startValue: 50.0, endValue: 75.0 },
            { startValue: 75.0, endValue: 100.0 },
        ])
    })

    it('returns quantiles for CLASSIFICATION_EQUAL_COUNTS', () => {
        const values = [1, 2, 3, 4, 5, 6]
        const { items } = getLegendItems(values, CLASSIFICATION_EQUAL_COUNTS, {
            numClasses: 3,
        })
        expect(items).toEqual([
            { startValue: 1.0, endValue: 3.0 },
            { startValue: 3.0, endValue: 5.0 },
            { startValue: 5.0, endValue: 6.0 },
        ])
    })

    it('returns undefined if method is unknown', () => {
        const { items } = getLegendItems([0, 100], 'UNKNOWN', { numClasses: 3 })
        expect(items).toBeUndefined()
    })

    it('returns standard deviation classification', () => {
        // values: mean=50, sd≈31.62, 5 classes → breaks at 50-2*sd, 50-sd, 50, 50+sd
        const values = [0, 10, 20, 50, 80, 90, 100]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_STANDARD_DEVIATION,
            { numClasses: 5 }
        )
        expect(items.length).toBeGreaterThanOrEqual(1)
        expect(items.length).toBeLessThanOrEqual(5)
        expect(items[0].startValue).toBe(0)
        expect(items[items.length - 1].endValue).toBe(100)
    })

    it('returns logarithmic classification with equal number of items', () => {
        const values = [1, 10, 100, 1000, 10000]
        const { items } = getLegendItems(values, CLASSIFICATION_LOGARITHMIC, {
            numClasses: 4,
        })
        expect(items).toHaveLength(4)
        expect(items[0].startValue).toBe(1)
        expect(items[3].endValue).toBe(10000)
        // Each class should span one order of magnitude on the log scale
        expect(items[0].endValue).toBe(items[1].startValue)
    })

    it('falls back to equal intervals for logarithmic when min <= 0', () => {
        const values = [0, 25, 50, 75, 100]
        const { items: logItems } = getLegendItems(
            values,
            CLASSIFICATION_LOGARITHMIC,
            { numClasses: 4 }
        )
        const { items: equalItems } = getLegendItems(
            values,
            CLASSIFICATION_EQUAL_INTERVALS,
            { numClasses: 4 }
        )
        expect(logItems).toEqual(equalItems)
    })

    it('returns pretty breaks with round class boundaries', () => {
        const values = [0, 100]
        const { items } = getLegendItems(values, CLASSIFICATION_PRETTY_BREAKS, {
            numClasses: 5,
        })
        expect(items.length).toBeGreaterThanOrEqual(1)
        expect(items.length).toBeLessThanOrEqual(5)
        expect(items[0].startValue).toBe(0)
        expect(items[items.length - 1].endValue).toBe(100)
    })

    it('pretty breaks internal boundaries are multiples of a round step', () => {
        const values = [0, 100]
        const { items } = getLegendItems(values, CLASSIFICATION_PRETTY_BREAKS, {
            numClasses: 5,
        })
        // Internal break should be at 20 (niceStep=20 for range=100, n=5)
        expect(items[0].endValue).toBe(20)
    })
})
