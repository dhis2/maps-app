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
    parseRange,
    isRegularLegendItem,
    buildIsolatedLegendItem,
    legendNamesContainRange,
} from '../legend.js'

describe('sortLegendItems', () => {
    it('sorts items by startValue descending', () => {
        const items = [
            { startValue: 20, endValue: 30 },
            { startValue: 0, endValue: 10 },
            { startValue: 10, endValue: 20 },
        ]
        expect(sortLegendItems(items).map((i) => i.startValue)).toEqual([
            20, 10, 0,
        ])
    })

    it('sorts items with from/to keys descending', () => {
        const items = [
            { from: 5, to: 10 },
            { from: 0, to: 5 },
            { from: 10, to: 15 },
        ]
        expect(sortLegendItems(items).map((i) => i.from)).toEqual([10, 5, 0])
    })

    it('places isIsolated items after regular items, before no-range items', () => {
        const items = [
            { name: 'no range' },
            { startValue: 0, endValue: 10 },
            { startValue: 4, endValue: 8, isIsolated: true },
        ]
        const sorted = sortLegendItems(items)
        expect(sorted[0].isIsolated).toBeUndefined()
        expect(sorted[0].startValue).toBe(0)
        expect(sorted[1].isIsolated).toBe(true)
        expect(sorted[2].name).toBe('no range')
    })

    it('places items without range keys at the end', () => {
        const items = [
            { startValue: 10, endValue: 20 },
            { name: 'Other', color: 'grey' },
            { startValue: 0, endValue: 10 },
        ]
        const sorted = sortLegendItems(items)
        expect(sorted[0].startValue).toBe(10)
        expect(sorted[1].startValue).toBe(0)
        expect(sorted[2].name).toBe('Other')
    })

    it('does not mutate the original array', () => {
        const items = [
            { startValue: 10, endValue: 20 },
            { startValue: 0, endValue: 10 },
        ]
        const copy = [...items]
        sortLegendItems(items)
        expect(items).toEqual(copy)
    })

    it('sorts by endValue descending when startValues are equal', () => {
        const items = [
            { startValue: 0, endValue: 10 },
            { startValue: 0, endValue: 20 },
            { startValue: 0, endValue: 15 },
        ]
        expect(sortLegendItems(items).map((i) => i.endValue)).toEqual([
            20, 15, 10,
        ])
    })
})

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
        it('returns legends sorted and preserves names as-is', () => {
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
            // name equal to range is preserved as-is
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

        it('returns a valueFormat function alongside items', () => {
            const { items, valueFormat } = getAutomaticLegendItems({
                data: [0, 50, 100],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: defaultColorScale,
            })
            expect(items.length).toBe(3)
            expect(typeof valueFormat).toBe('function')
        })

        it('does not add decimalPlaces when legendDecimalPlaces is undefined', () => {
            const { items } = getAutomaticLegendItems({
                data: [0, 100],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 4,
                colorScale: defaultColorScale,
            })
            items.forEach((item) => {
                expect(item).not.toHaveProperty('decimalPlaces')
            })
        })

        it('applies legendDecimalPlaces as precision to item boundary values', () => {
            const { items } = getAutomaticLegendItems({
                data: [0, 0.5, 1],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: defaultColorScale,
                legendDecimalPlaces: 2,
            })
            expect(items[0].endValue).toBe(0.33)
            expect(items[1].startValue).toBe(0.33)
            expect(items[1].endValue).toBe(0.67)
            expect(items[2].startValue).toBe(0.67)
        })

        it('rounds item boundary values to integers when legendDecimalPlaces is 0', () => {
            const { items } = getAutomaticLegendItems({
                data: [0, 0.5, 1],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: defaultColorScale,
                legendDecimalPlaces: 0,
            })
            items.forEach((item) => {
                expect(Number.isInteger(item.startValue)).toBe(true)
                expect(Number.isInteger(item.endValue)).toBe(true)
            })
        })

        it('prepends isolated item and classifies remaining data when legendIsolated is set', () => {
            const colorScale = ['#f00', '#0f0', '#00f', '#ff0', '#f0f']
            const data = [0, 10, 20, 50, 55, 60, 80, 90, 100]
            const { items } = getAutomaticLegendItems({
                data,
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale,
                legendIsolated: {
                    min: 40,
                    max: 70,
                    color: '#888',
                    name: 'Mid',
                },
            })
            expect(items[0]).toEqual(
                expect.objectContaining({ isIsolated: true, color: '#888' })
            )
            expect(items.slice(1)).toHaveLength(3)
            items
                .slice(1)
                .forEach((item) => expect(item.isIsolated).toBeUndefined())
        })

        it('returns only the isolated item when all data falls within isolated range', () => {
            const { items } = getAutomaticLegendItems({
                data: [45, 50, 55],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: defaultColorScale,
                legendIsolated: { min: 40, max: 60, color: '#888' },
            })
            expect(items).toHaveLength(1)
            expect(items[0].isIsolated).toBe(true)
        })

        it('returns only the isolated item when data array is empty but legendIsolated is set', () => {
            const { items } = getAutomaticLegendItems({
                data: [],
                method: CLASSIFICATION_EQUAL_INTERVALS,
                classes: 3,
                colorScale: defaultColorScale,
                legendIsolated: {
                    min: 40,
                    max: 60,
                    color: '#888',
                    name: 'Mid',
                },
            })
            expect(items).toHaveLength(1)
            expect(items[0].isIsolated).toBe(true)
        })
    })

    describe('legendNamesContainRange', () => {
        it('returns true when most item names contain their numeric range', () => {
            const items = [
                { name: '0 - 10', startValue: 0, endValue: 10 },
                { name: '10 - 20', startValue: 10, endValue: 20 },
                { name: '20 - 30', startValue: 20, endValue: 30 },
            ]
            expect(legendNamesContainRange(items)).toBe(true)
        })

        it('returns false when item names are descriptive labels', () => {
            const items = [
                { name: 'Low', startValue: 0, endValue: 10 },
                { name: 'Medium', startValue: 10, endValue: 20 },
                { name: 'High', startValue: 20, endValue: 30 },
            ]
            expect(legendNamesContainRange(items)).toBe(false)
        })

        it('returns false when the items array is empty', () => {
            expect(legendNamesContainRange([])).toBe(false)
        })

        it('ignores items with non-numeric startValue/endValue', () => {
            const items = [
                { name: 'Other', startValue: Number.NaN, endValue: Number.NaN },
            ]
            expect(legendNamesContainRange(items)).toBe(false)
        })
    })

    describe('isRegularLegendItem', () => {
        it('returns true for a plain legend item', () => {
            expect(
                isRegularLegendItem({
                    startValue: 0,
                    endValue: 10,
                    color: 'red',
                })
            ).toBe(true)
        })

        it('returns false for isNoData item', () => {
            expect(isRegularLegendItem({ isNoData: true })).toBe(false)
        })

        it('returns false for isUnclassified item', () => {
            expect(isRegularLegendItem({ isUnclassified: true })).toBe(false)
        })

        it('returns false for isIsolated item', () => {
            expect(isRegularLegendItem({ isIsolated: true })).toBe(false)
        })
    })

    describe('buildIsolatedLegendItem', () => {
        it('creates an item with isIsolated flag and correct range', () => {
            const item = buildIsolatedLegendItem({
                min: 50,
                max: 100,
                color: '#ff0000',
                name: 'High',
            })
            expect(item).toEqual({
                startValue: 50,
                endValue: 100,
                color: '#ff0000',
                name: 'High',
                isIsolated: true,
            })
        })

        it('omits name property when name is not provided', () => {
            const item = buildIsolatedLegendItem({
                min: 50,
                max: 100,
                color: '#ff0000',
            })
            expect(item).not.toHaveProperty('name')
            expect(item.isIsolated).toBe(true)
        })
    })

    describe('parseRange', () => {
        it('parses a range string into numeric start and end values', () => {
            expect(parseRange('10 - 20')).toEqual([10, 20])
        })

        it('parses a range string with decimal values', () => {
            expect(parseRange('1.5 - 3.75')).toEqual([1.5, 3.75])
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
