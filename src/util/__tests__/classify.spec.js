import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_NATURAL_BREAKS_RANGES,
    CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
    CLASSIFICATION_PRETTY_BREAKS,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_STANDARD_DEVIATION,
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

    it('applies valueFormat to value before lookup', () => {
        // 9.999 formatted to 2 decimals → 10.00, which falls in the second bin [10, 20)
        expect(
            getLegendItemForValue({
                value: 9.999,
                valueFormat: (v) => Number(v.toFixed(2)),
                legendItems,
            })
        ).toEqual(legendItems[1])
    })

    it('matches value equal to a single-value class (startValue === endValue)', () => {
        const items = [
            { startValue: 0, endValue: 10 },
            { startValue: 100, endValue: 100 },
            { startValue: 100, endValue: 200 },
        ]
        expect(
            getLegendItemForValue({ value: 100, legendItems: items })
        ).toEqual(items[1])
    })

    it('does not match single-value class with a different value', () => {
        const items = [
            { startValue: 0, endValue: 10 },
            { startValue: 100, endValue: 100 },
        ]
        expect(
            getLegendItemForValue({ value: 50, legendItems: items })
        ).toBeUndefined()
    })

    it('matches value at non-last cluster endValue under CLUSTERS method', () => {
        const clusterItems = [
            { startValue: 1, endValue: 3 },
            { startValue: 10, endValue: 12 },
            { startValue: 100, endValue: 102 },
        ]
        expect(
            getLegendItemForValue({
                value: 3,
                method: CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
                legendItems: clusterItems,
            })
        ).toEqual(clusterItems[0])
    })

    it('does not match non-last endValue under non-clusters method', () => {
        const intervalItems = [
            { startValue: 0, endValue: 10 },
            { startValue: 10, endValue: 20 },
        ]
        expect(
            getLegendItemForValue({
                value: 10,
                method: CLASSIFICATION_EQUAL_INTERVALS,
                legendItems: intervalItems,
            })
        ).toEqual(intervalItems[1])
    })

    it('still matches last endValue regardless of method', () => {
        const items = [
            { startValue: 0, endValue: 50 },
            { startValue: 50, endValue: 100 },
        ]
        expect(
            getLegendItemForValue({
                value: 100,
                method: CLASSIFICATION_EQUAL_INTERVALS,
                legendItems: items,
            })
        ).toEqual(items[1])
    })
})

describe('getLegendItems', () => {
    it('returns equal intervals for CLASSIFICATION_EQUAL_INTERVALS', () => {
        const values = [0, 25, 50, 75, 100]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_EQUAL_INTERVALS,
            4
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
        const { items } = getLegendItems(values, CLASSIFICATION_EQUAL_COUNTS, 3)
        expect(items).toEqual([
            { startValue: 1.0, endValue: 3.0 },
            { startValue: 3.0, endValue: 5.0 },
            { startValue: 5.0, endValue: 6.0 },
        ])
    })

    it('returns undefined if method is unknown', () => {
        const { items } = getLegendItems([0, 100], 'UNKNOWN', 3)
        expect(items).toBeUndefined()
    })

    it('returns a valueFormat function for known methods', () => {
        const { valueFormat } = getLegendItems(
            [0, 100],
            CLASSIFICATION_EQUAL_INTERVALS,
            4
        )
        expect(typeof valueFormat).toBe('function')
    })

    it('returns natural breaks (intervals) as continuous bins', () => {
        const values = [1, 2, 3, 10, 11, 12, 100, 101, 102]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_NATURAL_BREAKS_RANGES,
            3
        )
        expect(items).toHaveLength(3)
        expect(items[0].endValue).toBe(items[1].startValue)
        expect(items[1].endValue).toBe(items[2].startValue)
        expect(items[0].startValue).toBe(1)
        expect(items[2].endValue).toBe(102)
    })

    it('returns natural breaks (clusters) with gaps between clusters', () => {
        const values = [1, 2, 3, 10, 11, 12, 100, 101, 102]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
            3
        )
        expect(items).toHaveLength(3)
        expect(items[0].endValue).toBeLessThan(items[1].startValue)
        expect(items[1].endValue).toBeLessThan(items[2].startValue)
    })

    it('returns logarithmic bins for strictly positive data', () => {
        const values = [1, 10, 100, 1000, 10000]
        const { items } = getLegendItems(values, CLASSIFICATION_LOGARITHMIC, 4)
        expect(items).toHaveLength(4)
        expect(items[0].startValue).toBe(1)
        expect(items[3].endValue).toBe(10000)
        expect(items[0].endValue).toBe(items[1].startValue)
    })

    it('falls back to equal intervals for logarithmic when min <= 0', () => {
        const values = [0, 25, 50, 75, 100]
        const { items: logItems } = getLegendItems(
            values,
            CLASSIFICATION_LOGARITHMIC,
            4
        )
        const { items: equalItems } = getLegendItems(
            values,
            CLASSIFICATION_EQUAL_INTERVALS,
            4
        )
        expect(logItems).toEqual(equalItems)
    })

    it('returns standard deviation bins spanning [min, max]', () => {
        const values = [0, 10, 20, 50, 80, 90, 100]
        const { items } = getLegendItems(
            values,
            CLASSIFICATION_STANDARD_DEVIATION,
            5
        )
        expect(items[0].startValue).toBe(0)
        expect(items[items.length - 1].endValue).toBe(100)
        expect(items.length).toBeGreaterThanOrEqual(1)
        expect(items.length).toBeLessThanOrEqual(5)
    })

    it('returns pretty breaks with round boundaries', () => {
        const { items } = getLegendItems(
            [0, 100],
            CLASSIFICATION_PRETTY_BREAKS,
            5
        )
        expect(items[0].endValue).toBe(20)
    })

    it('removes consecutive duplicate bins', () => {
        const values = [5, 5, 5, 5, 5, 10, 10, 10]
        const { items } = getLegendItems(values, CLASSIFICATION_EQUAL_COUNTS, 5)
        for (let i = 1; i < items.length; i++) {
            expect(
                items[i].startValue === items[i - 1].startValue &&
                    items[i].endValue === items[i - 1].endValue
            ).toBe(false)
        }
    })

    it('caps class count for natural breaks (intervals) when fewer distinct values', () => {
        const { items } = getLegendItems(
            [1, 2, 3],
            CLASSIFICATION_NATURAL_BREAKS_RANGES,
            5
        )
        expect(items).toHaveLength(3)
    })

    it('caps class count for natural breaks (clusters) when fewer distinct values', () => {
        const { items } = getLegendItems(
            [1, 2, 3],
            CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
            5
        )
        expect(items).toHaveLength(3)
    })

    it('caps class count for equal counts when fewer distinct values', () => {
        const { items } = getLegendItems(
            [1, 2, 3],
            CLASSIFICATION_EQUAL_COUNTS,
            5
        )
        expect(items.length).toBeLessThanOrEqual(3)
    })

    it('does not throw for pretty breaks with few distinct values', () => {
        expect(() =>
            getLegendItems([1, 2], CLASSIFICATION_PRETTY_BREAKS, 5)
        ).not.toThrow()
    })

    it('does not throw for standard deviation with few distinct values', () => {
        expect(() =>
            getLegendItems([1, 2], CLASSIFICATION_STANDARD_DEVIATION, 5)
        ).not.toThrow()
    })

    it('returns single bin when all values are equal', () => {
        const { items } = getLegendItems(
            [5, 5, 5, 5],
            CLASSIFICATION_EQUAL_INTERVALS,
            4
        )
        expect(items).toEqual([{ startValue: 5, endValue: 5 }])
    })

    it('short-circuits to single bin for all-equal values regardless of method', () => {
        const methods = [
            CLASSIFICATION_EQUAL_INTERVALS,
            CLASSIFICATION_EQUAL_COUNTS,
            CLASSIFICATION_NATURAL_BREAKS_RANGES,
            CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
            CLASSIFICATION_STANDARD_DEVIATION,
            CLASSIFICATION_LOGARITHMIC,
            CLASSIFICATION_PRETTY_BREAKS,
        ]
        methods.forEach((method) => {
            const { items } = getLegendItems([7, 7, 7], method, 5)
            expect(items).toEqual([{ startValue: 7, endValue: 7 }])
        })
    })

    it('all-equal single bin is matched by getLegendItemForValue', () => {
        const { items } = getLegendItems(
            [7, 7, 7],
            CLASSIFICATION_EQUAL_INTERVALS,
            5
        )
        expect(getLegendItemForValue({ value: 7, legendItems: items })).toEqual(
            items[0]
        )
    })
})
