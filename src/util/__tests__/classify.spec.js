import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
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

    it('returns undefined if value is null', () => {
        expect(getLegendItemForValue(legendItems, null)).toBeUndefined()
    })

    it('returns undefined if legendItems is empty', () => {
        expect(getLegendItemForValue([], 5)).toBeUndefined()
    })

    it('returns correct item for value in range', () => {
        expect(getLegendItemForValue(legendItems, 15)).toEqual(legendItems[1])
    })

    it('returns last bin if value equals last bin end', () => {
        expect(getLegendItemForValue(legendItems, 30)).toEqual(legendItems[2])
    })

    it('returns clamped first bin if value is below range', () => {
        expect(getLegendItemForValue(legendItems, -5, true)).toEqual(
            legendItems[0]
        )
    })

    it('returns clamped last bin if value is above range', () => {
        expect(getLegendItemForValue(legendItems, 100, true)).toEqual(
            legendItems[2]
        )
    })

    it('returns undefined if unclamped value is out of range', () => {
        expect(getLegendItemForValue(legendItems, -1, false)).toBeUndefined()
    })
})

describe('getLegendItems', () => {
    it('returns equal intervals for CLASSIFICATION_EQUAL_INTERVALS', () => {
        const values = [0, 100]
        const result = getLegendItems(values, CLASSIFICATION_EQUAL_INTERVALS, 4)
        expect(result).toEqual([
            { startValue: 0.0, endValue: 25.0 },
            { startValue: 25.0, endValue: 50.0 },
            { startValue: 50.0, endValue: 75.0 },
            { startValue: 75.0, endValue: 100.0 },
        ])
    })

    it('returns quantiles for CLASSIFICATION_EQUAL_COUNTS', () => {
        const values = [1, 2, 3, 4, 5, 6]
        const result = getLegendItems(values, CLASSIFICATION_EQUAL_COUNTS, 3)
        expect(result).toEqual([
            { startValue: 1.0, endValue: 3.0 },
            { startValue: 3.0, endValue: 5.0 },
            { startValue: 5.0, endValue: 6.0 },
        ])
    })

    it('returns undefined if method is unknown', () => {
        const result = getLegendItems([0, 100], 'UNKNOWN', 3)
        expect(result).toBeUndefined()
    })
})
