import {
    getDataItemFromColumns,
    setDataItemInColumns,
    getOrgUnitsFromRows,
    getOrgUnitNodesFromRows,
    setOrgUnitPathInRows,
    getPeriodsFromFilters,
    removePeriodFromFilters,
    setFiltersFromPeriods,
    applyPeriodFilter,
    getFiltersFromColumns,
    getRenderingStrategy,
    getDimensionsFromFilters,
    splitFilter,
    splitFilterColumns,
    compactFilterColumns,
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

    it('should return empty array if filters is undefined', () => {
        expect(getPeriodsFromFilters(undefined)).toEqual([])
    })

    it('should return empty array if filters is defined but there are no periods', () => {
        const filters = [
            { dimension: 'dx', items: [{ id: 'data1' }] },
            { dimension: 'ou', items: [{ id: 'org1' }] },
        ]
        expect(getPeriodsFromFilters(filters)).toEqual([])
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

describe('applyPeriodFilter', () => {
    const createRequest = () => {
        const request = {
            addPeriodFilter: jest.fn(() => request),
            withStartDate: jest.fn(() => request),
            withEndDate: jest.fn(() => request),
        }
        return request
    }

    it('adds a period filter when periods are selected', () => {
        const request = createRequest()
        const periods = [{ id: '202101' }, { id: '202102' }]

        applyPeriodFilter(request, { periods, startDate: '', endDate: '' })

        expect(request.addPeriodFilter).toHaveBeenCalledWith([
            '202101',
            '202102',
        ])
        expect(request.withStartDate).not.toHaveBeenCalled()
        expect(request.withEndDate).not.toHaveBeenCalled()
    })

    it('falls back to start/end dates when no periods are selected', () => {
        const request = createRequest()

        applyPeriodFilter(request, {
            periods: [],
            startDate: '2023-01-01T00:00:00',
            endDate: '2023-12-31T00:00:00',
        })

        expect(request.addPeriodFilter).not.toHaveBeenCalled()
        expect(request.withStartDate).toHaveBeenCalledWith('2023-01-01')
        expect(request.withEndDate).toHaveBeenCalledWith('2023-12-31')
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

describe('getDimensionsFromFilters', () => {
    it('should return an array of dimension names from filters', () => {
        const filters = [
            {
                items: [
                    {
                        dimensionItemType: 'PERIOD',
                        name: 'This year',
                    },
                ],
                dimension: 'pe',
            },
            {
                dimension: 'J5jldMd8OHv',
                items: [
                    {
                        name: 'CHC',
                    },
                ],
            },
            {
                dimension: 'Bpx0589u8y0',
                items: [
                    {
                        name: 'Mission',
                    },
                ],
            },
        ]

        const expectedDimensions = [
            {
                dimension: 'J5jldMd8OHv',
                items: [
                    {
                        name: 'CHC',
                    },
                ],
            },
            {
                dimension: 'Bpx0589u8y0',
                items: [
                    {
                        name: 'Mission',
                    },
                ],
            },
        ]
        expect(getDimensionsFromFilters(filters)).toEqual(expectedDimensions)
    })

    it('should return an empty array if filters is undefined', () => {
        expect(getDimensionsFromFilters(undefined)).toEqual([])
    })

    it('should return an empty array if filters is empty', () => {
        expect(getDimensionsFromFilters([])).toEqual([])
    })

    it('should ignore filter objects without a dimension property', () => {
        const filters = [
            { dimension: 'pe', items: [{ id: 'period1' }] },
            { items: [{ id: 'data1' }] },
        ]
        expect(getDimensionsFromFilters(filters)).toEqual([])
    })

    it('should ignore the pe property', () => {
        const filters = [{ dimension: 'pe', items: [{ id: 'period1' }] }]
        expect(getDimensionsFromFilters(filters)).toEqual([])
    })
})

describe('splitFilter', () => {
    it('returns a single condition unchanged', () => {
        expect(splitFilter('GT:50')).toEqual(['GT:50'])
    })

    it('splits two conditions on the same dimension', () => {
        expect(splitFilter('GT:50:LT:60')).toEqual(['GT:50', 'LT:60'])
    })

    it('handles EQ operator', () => {
        expect(splitFilter('EQ:42')).toEqual(['EQ:42'])
    })

    it('handles three consecutive conditions', () => {
        expect(splitFilter('GE:10:LT:20:NE:15')).toEqual([
            'GE:10',
            'LT:20',
            'NE:15',
        ])
    })

    it('returns the original string wrapped in an array when no known operator is found', () => {
        expect(splitFilter('unknownOp:50')).toEqual(['unknownOp:50'])
    })

    it('returns [undefined] when called with undefined', () => {
        expect(splitFilter(undefined)).toEqual([undefined])
    })
})

describe('splitFilterColumns', () => {
    it('expands a compact filter column into individual rows', () => {
        const cols = [
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50:LT:60' },
        ]
        expect(splitFilterColumns(cols)).toEqual([
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50' },
            { dimension: 'ageDE', name: 'Age', filter: 'LT:60' },
        ])
    })

    it('leaves a single-condition filter unchanged', () => {
        const cols = [{ dimension: 'ageDE', name: 'Age', filter: 'GT:50' }]
        expect(splitFilterColumns(cols)).toEqual([
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50' },
        ])
    })

    it('passes through a null-filter placeholder row unchanged', () => {
        const cols = [{ dimension: null, name: null, filter: null }]
        expect(splitFilterColumns(cols)).toEqual([
            { dimension: null, name: null, filter: null },
        ])
    })

    it('handles a mix of compact and single columns', () => {
        const cols = [
            { dimension: 'ageDE', filter: 'GT:50:LT:60' },
            { dimension: 'otherDE', filter: 'EQ:yes' },
        ]
        expect(splitFilterColumns(cols)).toEqual([
            { dimension: 'ageDE', filter: 'GT:50' },
            { dimension: 'ageDE', filter: 'LT:60' },
            { dimension: 'otherDE', filter: 'EQ:yes' },
        ])
    })
})

describe('compactFilterColumns', () => {
    it('combines multiple rows on the same dimension into one compact column', () => {
        const rows = [
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50' },
            { dimension: 'ageDE', name: 'Age', filter: 'LT:60' },
        ]
        expect(compactFilterColumns(rows)).toEqual([
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50:LT:60' },
        ])
    })

    it('keeps different dimensions as separate entries', () => {
        const rows = [
            { dimension: 'ageDE', filter: 'GT:50' },
            { dimension: 'otherDE', filter: 'EQ:yes' },
        ]
        expect(compactFilterColumns(rows)).toEqual([
            { dimension: 'ageDE', filter: 'GT:50' },
            { dimension: 'otherDE', filter: 'EQ:yes' },
        ])
    })

    it('passes through an incomplete row (null dimension) unchanged', () => {
        const rows = [{ dimension: null, name: null, filter: null }]
        expect(compactFilterColumns(rows)).toEqual([
            { dimension: null, name: null, filter: null },
        ])
    })

    it('picks the name from the first row when later rows have no name', () => {
        const rows = [
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50' },
            { dimension: 'ageDE', name: null, filter: 'LT:60' },
        ]
        expect(compactFilterColumns(rows)).toEqual([
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50:LT:60' },
        ])
    })

    it('round-trips with splitFilterColumns', () => {
        const original = [
            { dimension: 'ageDE', name: 'Age', filter: 'GT:50:LT:60' },
        ]
        expect(compactFilterColumns(splitFilterColumns(original))).toEqual(
            original
        )
    })
})
