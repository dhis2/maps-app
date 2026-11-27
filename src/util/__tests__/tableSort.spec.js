import {
    SENTINEL_NO_VALUE,
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
} from '../../constants/dataTable.js'
import {
    compareColumnOptionValues,
    compareFieldValues,
    compareRangeValues,
    compareRows,
    getLegendRank,
    isLegendColumn,
} from '../tableSort.js'

describe('compareFieldValues', () => {
    it('sorts numbers ascending', () => {
        expect(
            compareFieldValues(5, 10, { sortDirection: 'asc' })
        ).toBeLessThan(0)
    })

    it('sorts numbers descending', () => {
        expect(
            compareFieldValues(5, 10, { sortDirection: 'desc' })
        ).toBeGreaterThan(0)
    })

    it('sorts strings ascending, locale-aware', () => {
        expect(
            compareFieldValues('Apple', 'Banana', { sortDirection: 'asc' })
        ).toBeLessThan(0)
    })

    it('sorts strings descending', () => {
        expect(
            compareFieldValues('Apple', 'Banana', { sortDirection: 'desc' })
        ).toBeGreaterThan(0)
    })

    it('counts empty values as the lowest: first when ascending, last when descending', () => {
        expect(
            compareFieldValues(undefined, 5, { sortDirection: 'asc' })
        ).toBeLessThan(0)
        expect(
            compareFieldValues(undefined, 5, { sortDirection: 'desc' })
        ).toBeGreaterThan(0)
        expect(
            compareFieldValues('', 'Bo', { sortDirection: 'asc' })
        ).toBeLessThan(0)
    })

    it('treats two undefined values as equal', () => {
        expect(
            compareFieldValues(undefined, undefined, { sortDirection: 'asc' })
        ).toBe(0)
    })

    it('counts null values as empty too, without throwing (e.g. a period column with no data for some rows)', () => {
        expect(
            compareFieldValues(null, 5, { sortDirection: 'asc' })
        ).toBeLessThan(0)
        expect(
            compareFieldValues(5, null, { sortDirection: 'desc' })
        ).toBeLessThan(0)
    })

    it('treats null and undefined as equally "no value"', () => {
        expect(
            compareFieldValues(null, undefined, { sortDirection: 'asc' })
        ).toBe(0)
        expect(
            compareFieldValues(undefined, null, { sortDirection: 'asc' })
        ).toBe(0)
    })

    it('delegates to compareRangeValues for the Range column', () => {
        expect(
            compareFieldValues('5-10', '1-3', {
                sortField: 'range',
                sortDirection: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    describe('org-unit-renderer columns - sorts by the resolved display name, not the raw stored path/id', () => {
        const idToName = new Map([
            ['country1', 'Sierra Leone'],
            ['zFacility', 'Bargbe'],
            ['aFacility', 'Upper Bambara'],
        ])

        it('RENDERER_ORG_UNIT_NAME: compares the resolved leaf name, not the raw id', () => {
            expect(
                compareFieldValues(
                    '/country1/aFacility',
                    '/country1/zFacility',
                    {
                        sortDirection: 'asc',
                        orgUnitRenderer: RENDERER_ORG_UNIT_NAME,
                        idToName,
                    }
                )
            ).toBeGreaterThan(0)
        })

        it('RENDERER_ORG_UNIT: compares the resolved full breadcrumb, not the raw path', () => {
            expect(
                compareFieldValues(
                    '/country1/aFacility',
                    '/country1/zFacility',
                    {
                        sortDirection: 'asc',
                        orgUnitRenderer: RENDERER_ORG_UNIT,
                        idToName,
                    }
                )
            ).toBeGreaterThan(0)
        })

        it('falls back to the raw value when no renderer is given (e.g. a plain string column)', () => {
            expect(
                compareFieldValues(
                    '/country1/aFacility',
                    '/country1/zFacility',
                    {
                        sortDirection: 'asc',
                    }
                )
            ).toBeLessThan(0)
        })
    })
})

describe('compareRangeValues', () => {
    it('compares by range start first', () => {
        expect(compareRangeValues('10-20', '1-5', 'asc')).toBeGreaterThan(0)
    })

    it('falls back to range end when starts are equal', () => {
        expect(compareRangeValues('1-20', '1-5', 'asc')).toBeGreaterThan(0)
    })

    it('reverses order when descending', () => {
        expect(compareRangeValues('10-20', '1-5', 'desc')).toBeLessThan(0)
    })
})

describe('compareRows', () => {
    it('falls back to natural (index) order when there is no sortField', () => {
        expect(
            compareRows({ index: 2 }, { index: 0 }, { sortField: null })
        ).toBeGreaterThan(0)
    })

    it('otherwise sorts by the named field via compareFieldValues', () => {
        expect(
            compareRows(
                { rawValue: 5 },
                { rawValue: 10 },
                { sortField: 'rawValue', sortDirection: 'asc' }
            )
        ).toBeLessThan(0)
    })

    describe('legend columns', () => {
        const sortRows = (rows, legendItems, sortDirection) => {
            const getRank = getLegendRank(legendItems)
            return [...rows]
                .sort((a, b) =>
                    compareRows(a, b, {
                        sortField: 'legend',
                        sortDirection,
                        getRank,
                    })
                )
                .map(({ legend }) => legend)
        }

        describe('classes with a range', () => {
            const ITEMS = [
                { name: 'No data', color: '#ccc', isNoData: true },
                { name: 'Low', startValue: 0, endValue: 30, color: '#fee' },
                { name: 'High', startValue: 50, endValue: 90, color: '#f00' },
                { startValue: 30, endValue: 50, color: '#f88' },
                { name: 'Unclassified', color: '#999', isUnclassified: true },
                {
                    name: 'Outliers',
                    startValue: 90,
                    endValue: 990,
                    color: '#000',
                    isIsolated: true,
                },
            ]
            const ROWS = [
                'No data',
                'Low',
                'Outliers',
                'Other',
                'High',
                'Unclassified',
            ]
                .map((legend) => ({ legend }))
                .concat({ legend: '30 – 50', color: '#f88' })

            it('sorts descending as the layer card lists them, "No data" and rows outside the legend last', () => {
                expect(sortRows(ROWS, ITEMS, 'desc')).toEqual([
                    'High',
                    '30 – 50',
                    'Low',
                    'Outliers',
                    'Unclassified',
                    'No data',
                    'Other',
                ])
            })

            it('sorts ascending in the reverse order, "No data" and rows outside the legend first', () => {
                expect(sortRows(ROWS, ITEMS, 'asc')).toEqual([
                    'Other',
                    'No data',
                    'Unclassified',
                    'Outliers',
                    'Low',
                    '30 – 50',
                    'High',
                ])
            })
        })

        describe('groups', () => {
            const ITEMS = [
                { name: 'CHC', image: 'c.png' },
                { name: 'MCHP', image: 'm.png' },
                { name: 'Unclassified', color: '#ccc', isUnclassified: true },
            ]
            const ROWS = ['MCHP', 'Unclassified', 'CHC'].map((legend) => ({
                legend,
            }))

            it('sorts ascending by name, as the layer card lists them, "Unclassified" first', () => {
                expect(sortRows(ROWS, ITEMS, 'asc')).toEqual([
                    'Unclassified',
                    'CHC',
                    'MCHP',
                ])
            })

            it('sorts descending in the reverse order, "Unclassified" last', () => {
                expect(sortRows(ROWS, ITEMS, 'desc')).toEqual([
                    'MCHP',
                    'CHC',
                    'Unclassified',
                ])
            })
        })
    })
})

describe('isLegendColumn', () => {
    it.each([
        [{ dataKey: 'legend' }, true],
        [{ dataKey: 'range' }, true],
        [{ dataKey: 'group' }, true],
        [{ dataKey: 'color', renderer: RENDERER_COLOR }, true],
        [{ dataKey: 'iconUrl', renderer: RENDERER_ICON }, true],
        [{ dataKey: 'rawValue' }, false],
        [undefined, false],
    ])('%j is %s', (header, isLegend) => {
        expect(isLegendColumn(header)).toBe(isLegend)
    })
})

describe('compareColumnOptionValues', () => {
    it('sorts the blank-cell sentinel first, regardless of direction', () => {
        expect(
            compareColumnOptionValues(SENTINEL_NO_VALUE, 'High', {
                dataKey: 'legend',
                type: 'string',
                direction: 'desc',
            })
        ).toBeLessThan(0)
        expect(
            compareColumnOptionValues('High', SENTINEL_NO_VALUE, {
                dataKey: 'legend',
                type: 'string',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('compares numeric-typed columns numerically', () => {
        expect(
            compareColumnOptionValues('10', '2', {
                dataKey: 'value',
                type: 'number',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('compares string-typed columns lexically', () => {
        expect(
            compareColumnOptionValues('Apple', 'Banana', {
                dataKey: 'legend',
                type: 'string',
                direction: 'asc',
            })
        ).toBeLessThan(0)
    })

    it('delegates Range columns to compareRangeValues', () => {
        expect(
            compareColumnOptionValues('10-20', '1-5', {
                dataKey: 'range',
                type: 'string',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('defaults to ascending when no direction is given', () => {
        expect(
            compareColumnOptionValues('Apple', 'Banana', {
                dataKey: 'legend',
                type: 'string',
            })
        ).toBeLessThan(0)
    })
})
