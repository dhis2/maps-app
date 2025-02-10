import {
    getDataItemFromColumns,
    setDataItemInColumns,
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    setOrgUnitPathInRows,
    getPeriodFromFilters,
    getPeriodsFromFilters,
    removePeriodFromFilters,
    setFiltersFromPeriod,
    setFiltersFromPeriods,
    getFiltersFromColumns,
    getRenderingStrategy,
} from '../analytics.js'

describe('getDataItemFromColumns', () => {
    it('should return the first data item from columns', () => {
        const columns = [
            { dimension: 'dx', items: [{ id: 'item1' }, { id: 'item2' }] },
        ]
        expect(getDataItemFromColumns(columns)).toEqual({ id: 'item1' })
    })

    it('should return undefined if no data item is found', () => {
        const columns = []
        expect(getDataItemFromColumns(columns)).toBeUndefined()
    })
})

describe('setDataItemInColumns', () => {
    it('should return a new dimension array with the specified data item', () => {
        const dataItem = { id: 'item1', name: 'Item 1' }
        const dimension = 'reportingRate'
        const result = setDataItemInColumns(dataItem, dimension)

        expect(result).toEqual([
            {
                dimension: 'dx',
                items: [
                    {
                        id: 'item1.REPORTING_RATE',
                        name: 'Item 1',
                        dimensionItemType: expect.any(String),
                        legendSet: undefined,
                    },
                ],
                objectName: expect.any(String),
            },
        ])
    })

    it('should return an empty array if the dimension is not valid', () => {
        const dataItem = { id: 'item1', name: 'Item 1' }
        expect(setDataItemInColumns(dataItem, 'invalid')).toEqual([])
    })
})

describe('getOrgUnitsFromRows', () => {
    it('should return organisation units from rows', () => {
        const rows = [
            { dimension: 'ou', items: [{ id: 'org1' }, { id: 'org2' }] },
        ]
        expect(getOrgUnitsFromRows(rows)).toEqual([
            { id: 'org1' },
            { id: 'org2' },
        ])
    })
})

describe('getOrgUnitNodesFromRows', () => {
    it('should filter and return valid organisation unit nodes', () => {
        const rows = [
            {
                dimension: 'ou',
                items: [{ id: 'org1valid00' }, { id: 'invalid' }],
            },
        ]
        expect(getOrgUnitNodesFromRows(rows)).toEqual([{ id: 'org1valid00' }])
    })
})

describe('setOrgUnitPathInRows', () => {
    it('should set path for the specified organisation unit', () => {
        const rows = [
            { dimension: 'ou', items: [{ id: 'org1' }, { id: 'org2' }] },
        ]
        const result = setOrgUnitPathInRows(rows, 'org1', '/path/to/org1')

        expect(result).toEqual([
            {
                dimension: 'ou',
                items: [{ id: 'org2' }, { id: 'org1', path: '/path/to/org1' }],
            },
        ])
    })
})

describe('getPeriodFromFilters', () => {
    it('should return the first period from filters', () => {
        const filters = [{ dimension: 'pe', items: [{ id: 'period1' }] }]
        expect(getPeriodFromFilters(filters)).toEqual({ id: 'period1' })
    })
})

describe('getPeriodsFromFilters', () => {
    it('should return all periods from filters', () => {
        const filters = [
            {
                dimension: 'pe',
                items: [{ id: 'period1' }, { id: 'period2' }],
            },
        ]
        expect(getPeriodsFromFilters(filters)).toEqual([
            { id: 'period1' },
            { id: 'period2' },
        ])
    })
})

describe('removePeriodFromFilters', () => {
    it('should remove periods from filters', () => {
        const filters = [
            { dimension: 'pe', items: [{ id: 'period1' }] },
            { dimension: 'dx', items: [{ id: 'data1' }] },
        ]
        expect(removePeriodFromFilters(filters)).toEqual([
            { dimension: 'dx', items: [{ id: 'data1' }] },
        ])
    })
})

describe('setFiltersFromPeriod', () => {
    it('should add a period to the filters', () => {
        const filters = [{ dimension: 'dx', items: [{ id: 'data1' }] }]
        const period = { id: 'period1' }

        expect(setFiltersFromPeriod(filters, period)).toEqual([
            { dimension: 'dx', items: [{ id: 'data1' }] },
            { dimension: 'pe', items: [{ id: 'period1' }] },
        ])
    })
})

describe('setFiltersFromPeriods', () => {
    it('should replace existing period filters and add new periods', () => {
        const filters = [
            { dimension: 'pe', items: [{ id: '202101' }] },
            { dimension: 'ou', items: [{ id: 'orgUnit1' }] },
        ]
        const periods = [{ id: '202102' }, { id: '202103' }]

        const result = setFiltersFromPeriods(filters, periods)

        expect(result).toEqual([
            { dimension: 'ou', items: [{ id: 'orgUnit1' }] },
            { dimension: 'pe', items: [{ id: '202102' }, { id: '202103' }] },
        ])
    })

    it('should handle empty initial filters', () => {
        const filters = []
        const periods = [{ id: '202201' }]

        const result = setFiltersFromPeriods(filters, periods)

        expect(result).toEqual([{ dimension: 'pe', items: [{ id: '202201' }] }])
    })
})

describe('getFiltersFromColumns', () => {
    it('should return filters from columns with a filter property', () => {
        const columns = [
            { dimension: 'dx', filter: 'EQ:123' },
            { dimension: 'pe' },
        ]

        const result = getFiltersFromColumns(columns)

        expect(result).toEqual([{ dimension: 'dx', filter: 'EQ:123' }])
    })

    it('should return null if no filters are present', () => {
        const columns = [{ dimension: 'dx' }, { dimension: 'pe' }]

        const result = getFiltersFromColumns(columns)

        expect(result).toBeNull()
    })
})

describe('getRenderingStrategy', () => {
    it('should return "timeline" if any map view has a timeline rendering strategy', () => {
        const mapViews = [{ renderingStrategy: 'TIMELINE' }]
        expect(getRenderingStrategy({ mapViews })).toBe('timeline')
    })

    it('should return "split-by-period" if any map view has a split-by-period rendering strategy', () => {
        const mapViews = [{ renderingStrategy: 'SPLIT_BY_PERIOD' }]
        expect(getRenderingStrategy({ mapViews })).toBe('split-by-period')
    })

    it('should return "single" if no specific rendering strategy is found', () => {
        const mapViews = [{ renderingStrategy: 'OTHER' }]
        expect(getRenderingStrategy({ mapViews })).toBe('single')
    })
})
