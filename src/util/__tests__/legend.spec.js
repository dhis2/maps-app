import {
    CLASSIFICATION_EQUAL_INTERVALS,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} from '../../constants/layers.js'
import { defaultClasses, defaultColorScale } from '../colors.js'
import {
    loadDataItemLegendSet,
    sortLegendItems,
    formatLegendItems,
    getBinsFromLegendItems,
    getColorScaleFromLegendItems,
    getLabelsFromLegendItems,
    getPredefinedLegendItems,
    getAutomaticLegendItems,
    getRenderingLabel,
} from '../legend.js'

describe('legend utils', () => {
    describe('loadDataItemLegendSet', () => {
        it('returns null when no dataItem provided', async () => {
            const result = await loadDataItemLegendSet(null, {})
            expect(result).toBeNull()
        })

        it('queries engine and returns legendSet for indicator', async () => {
            const dataItem = { dimensionItemType: 'INDICATOR', id: 'abc' }
            const fakeLegendSet = { id: 'ls1', legends: [] }
            const engine = {
                query: jest.fn().mockResolvedValue({
                    dimension: { legendSet: fakeLegendSet },
                }),
            }

            const result = await loadDataItemLegendSet(dataItem, engine)
            expect(engine.query).toHaveBeenCalled()
            expect(result).toBe(fakeLegendSet)
        })
    })

    describe('formatLegendItems / bins / colorScale / labels', () => {
        const items = [
            { startValue: 10, endValue: 19, color: 'red', name: 'A' },
            { startValue: 0, endValue: 9, color: 'blue', name: 'B' },
            { startValue: 20, endValue: 29, color: 'green', name: 'C' },
        ]

        it('formatLegendItems sorts by startValue and formats range', () => {
            const formatted = formatLegendItems(items)
            expect(formatted[0].range).toBe('0 - 9')
            expect(formatted.map((i) => i.color)).toEqual([
                'blue',
                'red',
                'green',
            ])
            expect(formatted.map((i) => i.name)).toEqual(['B', 'A', 'C'])
        })

        it('getBinsFromLegendItems returns start values and last end', () => {
            const bins = getBinsFromLegendItems(items)
            expect(bins).toEqual([0, 10, 20, 29])
        })

        it('getColorScaleFromLegendItems returns sorted colors', () => {
            const colors = getColorScaleFromLegendItems(items)
            expect(colors).toEqual(['blue', 'red', 'green'])
        })

        it('getLabelsFromLegendItems returns sorted names', () => {
            const labels = getLabelsFromLegendItems(items)
            expect(labels).toEqual(['B', 'A', 'C'])
        })
    })

    describe('getPredefinedLegendItems', () => {
        it('returns legends sorted and clears name when equals range', () => {
            const legendSet = {
                legends: [
                    {
                        name: '10 - 20',
                        startValue: 10,
                        endValue: 20,
                        color: 'red',
                    },
                    { name: 'A', startValue: 0, endValue: 9, color: 'blue' },
                ],
            }

            const result = getPredefinedLegendItems(legendSet)
            // sorted by startValue -> first item is startValue 0 (name 'A')
            expect(result[0].name).toBe('A')
            expect(result[1].name).toBe('10 - 20')
        })
    })

    describe('getAutomaticLegendItems', () => {
        it('returns items with colors from default color scale', () => {
            const data = [1, 2, 3, 4, 5]
            const { items } = getAutomaticLegendItems({
                data,
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: defaultClasses,
                colorScale: defaultColorScale,
            })
            expect(items.length).toBeGreaterThan(0)
            // each item should have a color from the provided colorScale
            items.forEach((item, idx) => {
                expect(item.color).toBe(defaultColorScale[idx])
            })
        })

        it('returns empty array when no data', () => {
            const { items } = getAutomaticLegendItems({
                data: [],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: defaultClasses,
                colorScale: defaultColorScale,
            })
            expect(items).toEqual([])
        })
    })

    describe('sortLegendItems', () => {
        it('returns a new array, does not mutate input', () => {
            const input = [
                { startValue: 0, endValue: 10 },
                { startValue: 20, endValue: 30 },
            ]
            const result = sortLegendItems(input)
            expect(result).not.toBe(input)
            expect(input[0].startValue).toBe(0)
        })

        it('sorts from/to items descending by start', () => {
            const items = [
                { from: 0, to: 10 },
                { from: 20, to: 30 },
                { from: 10, to: 20 },
            ]
            const result = sortLegendItems(items)
            expect(result.map((i) => i.from)).toEqual([20, 10, 0])
        })

        it('sorts startValue/endValue items descending by start', () => {
            const items = [
                { startValue: 0, endValue: 10 },
                { startValue: 20, endValue: 30 },
                { startValue: 10, endValue: 20 },
            ]
            const result = sortLegendItems(items)
            expect(result.map((i) => i.startValue)).toEqual([20, 10, 0])
        })

        it('uses end as tiebreaker when start values are equal', () => {
            const items = [
                { from: 10, to: 20 },
                { from: 10, to: 30 },
            ]
            const result = sortLegendItems(items)
            expect(result[0].to).toBe(30)
        })

        it('places no-range items last', () => {
            const items = [
                { name: 'label only' },
                { startValue: 10, endValue: 20 },
            ]
            const result = sortLegendItems(items)
            expect(result[0].startValue).toBe(10)
            expect(result[1].name).toBe('label only')
        })

        it('places isLegendIsolated items after regular, before no-range', () => {
            const items = [
                { name: 'label only' },
                { startValue: 5, endValue: 10, isLegendIsolated: true },
                { startValue: 10, endValue: 20 },
            ]
            const result = sortLegendItems(items)
            expect(result[0].startValue).toBe(10)
            expect(result[1].isLegendIsolated).toBe(true)
            expect(result[2].name).toBe('label only')
        })

        it('sorts both-isolated items numerically', () => {
            const items = [
                { startValue: 5, endValue: 10, isLegendIsolated: true },
                { startValue: 15, endValue: 20, isLegendIsolated: true },
            ]
            const result = sortLegendItems(items)
            expect(result[0].startValue).toBe(15)
        })

        it('handles empty array', () => {
            expect(sortLegendItems([])).toEqual([])
        })
    })

    describe('getRenderingLabel', () => {
        it('returns label for split strategy', () => {
            const label = getRenderingLabel(RENDERING_STRATEGY_SPLIT_BY_PERIOD)
            expect(label).toMatch(/Split/)
            expect(label.startsWith(' • ')).toBe(true)
        })

        it('returns label for timeline strategy', () => {
            const label = getRenderingLabel(RENDERING_STRATEGY_TIMELINE)
            expect(label).toMatch(/Timeline/)
            expect(label.startsWith(' • ')).toBe(true)
        })

        it('returns null when unknown', () => {
            expect(getRenderingLabel('unknown')).toBeNull()
        })
    })
})
