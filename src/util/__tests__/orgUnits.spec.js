import {
    USER_ORG_UNIT,
    USER_ORG_UNIT_CHILDREN,
    USER_ORG_UNIT_GRANDCHILDREN,
} from '@dhis2/analytics'
import {
    getStyledOrgUnits,
    addGroupCountsToLegend,
    addLevelCountsToLegend,
    getOrgUnitsWithoutCoordsCount,
    fetchAndParseGroupSet,
    loadGroupSetData,
    getUserOrgUnitIdsByKeyword,
    fetchOrgUnitDetails,
    fetchOrgUnitPaths,
} from '../orgUnits.js'

describe('getUserOrgUnitIdsByKeyword', () => {
    it('returns empty arrays for all three keywords when no org units are given', () => {
        expect(getUserOrgUnitIdsByKeyword()).toEqual({
            [USER_ORG_UNIT]: [],
            [USER_ORG_UNIT_CHILDREN]: [],
            [USER_ORG_UNIT_GRANDCHILDREN]: [],
        })
    })

    it('resolves USER_ORGUNIT to the ids of the user’s own org units', () => {
        const result = getUserOrgUnitIdsByKeyword([{ id: 'a' }, { id: 'b' }])
        expect(result[USER_ORG_UNIT]).toEqual(['a', 'b'])
    })

    it('resolves USER_ORGUNIT_CHILDREN to the flattened children of every user org unit', () => {
        const result = getUserOrgUnitIdsByKeyword([
            { id: 'a', children: [{ id: 'a1' }, { id: 'a2' }] },
            { id: 'b', children: [{ id: 'b1' }] },
        ])
        expect(result[USER_ORG_UNIT_CHILDREN]).toEqual(['a1', 'a2', 'b1'])
    })

    it('resolves USER_ORGUNIT_GRANDCHILDREN to the flattened grandchildren of every user org unit', () => {
        const result = getUserOrgUnitIdsByKeyword([
            {
                id: 'a',
                children: [
                    { id: 'a1', children: [{ id: 'a1a' }, { id: 'a1b' }] },
                    { id: 'a2', children: [{ id: 'a2a' }] },
                ],
            },
        ])
        expect(result[USER_ORG_UNIT_GRANDCHILDREN]).toEqual([
            'a1a',
            'a1b',
            'a2a',
        ])
    })

    it('treats a missing children field as having no children or grandchildren', () => {
        const result = getUserOrgUnitIdsByKeyword([{ id: 'a' }])
        expect(result[USER_ORG_UNIT_CHILDREN]).toEqual([])
        expect(result[USER_ORG_UNIT_GRANDCHILDREN]).toEqual([])
    })
})

describe('fetchOrgUnitDetails / fetchOrgUnitPaths error handling', () => {
    it('fetchOrgUnitDetails returns an empty object when the query fails', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Network error')),
        }
        const result = await fetchOrgUnitDetails(engine, ['ou1'])
        expect(result).toEqual({})
    })

    it('fetchOrgUnitPaths returns an empty array when the query fails', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Network error')),
        }
        const result = await fetchOrgUnitPaths(engine, ['ou1'])
        expect(result).toEqual([])
    })

    it('fetchOrgUnitPaths keeps results from batches that succeed when another batch fails', async () => {
        const batch1Ids = Array.from({ length: 100 }, (_, i) => `ou${i}`)
        const batch2Ids = ['ouExtra']
        const engine = {
            query: jest.fn((query, { variables }) => {
                if (variables.ids === batch1Ids.join(',')) {
                    return Promise.resolve({
                        organisationUnits: {
                            organisationUnits: [
                                { id: 'ou0', path: '/root/ou0' },
                            ],
                        },
                    })
                }
                return Promise.reject(new Error('Network error'))
            }),
        }
        const result = await fetchOrgUnitPaths(engine, [
            ...batch1Ids,
            ...batch2Ids,
        ])
        expect(result).toEqual([{ id: 'ou0', path: '/root/ou0' }])
    })

    it('fetchOrgUnitPaths skips a batch whose response is missing the organisationUnits array', async () => {
        const engine = {
            query: jest.fn().mockResolvedValue({ organisationUnits: {} }),
        }
        const result = await fetchOrgUnitPaths(engine, ['ou1'])
        expect(result).toEqual([])
    })
})

describe('getStyledOrgUnits', () => {
    it('should return styled features and legend for facility layer', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: {
                    hasAdditionalGeometry: false,
                    dimensions: {},
                    iconUrl: 'http://iconurl.com',
                },
            },
        ]
        const groupSet = {
            id: '1',
            name: 'GroupSet1',
            organisationUnitGroups: [],
        }
        const config = { organisationUnitColor: 'red', radiusLow: 10 }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
        })

        expect(result.styledFeatures).toHaveLength(1)
        expect(result.styledFeatures[0]).toMatchObject({
            geometry: { type: 'Point' },
            properties: {
                hasAdditionalGeometry: false,
                dimensions: {},
                iconUrl: 'http://iconurl.com',
                radius: 10,
            },
        })
        expect(result.styledFeatures[0].properties.radius).toEqual(10)
        expect(result.legend.unit).toEqual('GroupSet1')
    })

    it('should return an empty facility item with count when no group set is selected', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: { dimensions: {} },
            },
        ]
        const result = getStyledOrgUnits({
            features,
            groupSet: {},
            config: {},
            baseUrl: '/baseUrl',
        })
        expect(result.legend.items).toHaveLength(1)
        expect(result.legend.items[0]).toMatchObject({ name: 'Facility' })
    })

    it('should return styled features and legend for orgUnit layer', () => {
        const features = [
            {
                geometry: { type: 'Polygon' },
                properties: { level: 1, dimensions: {} },
            },
        ]
        const groupSet = { name: 'GroupSet1', organisationUnitGroups: [] }

        const config = { organisationUnitColor: 'red', radiusLow: 10 }

        const orgUnitLevels = {
            1: 'Level1',
            2: 'Level2',
            3: 'Level3',
            4: 'Level4',
        }

        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/contextPath',
            orgUnitLevels,
        })

        expect(result.styledFeatures).toHaveLength(1)
        expect(result.styledFeatures[0]).toMatchObject({
            geometry: { type: 'Polygon' },
            properties: { level: 1, dimensions: {}, weight: 1 },
        })
        expect(result.legend).toMatchObject({
            unit: 'GroupSet1',
            items: [{ name: 'Level1' }],
        })
    })

    it('should filter out unclassified facility when unclassifiedLegend not set', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: {
                    hasAdditionalGeometry: false,
                    dimensions: {},
                },
            },
        ]
        const groupSet = {
            id: 'gs1',
            name: 'GroupSet1',
            organisationUnitGroups: [
                {
                    id: 'g1',
                    name: 'Group1',
                    color: '#ff0000',
                    symbol: '21.png',
                },
            ],
        }
        const config = { radiusLow: 10 }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
        })

        expect(result.styledFeatures).toHaveLength(0)
        expect(result.legend.items).not.toContainEqual(
            expect.objectContaining({ name: 'Unclassified' })
        )
    })

    it('should include unclassified facility with unclassifiedLegend color when set', () => {
        const unclassifiedColor = '#aabbcc'
        const features = [
            {
                geometry: { type: 'Point' },
                properties: {
                    hasAdditionalGeometry: false,
                    dimensions: {},
                },
            },
        ]
        const groupSet = {
            id: 'gs1',
            name: 'GroupSet1',
            organisationUnitGroups: [
                {
                    id: 'g1',
                    name: 'Group1',
                    color: '#ff0000',
                    symbol: '21.png',
                },
            ],
        }
        const config = {
            radiusLow: 10,
            unclassifiedLegend: { color: unclassifiedColor },
        }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
        })

        expect(result.styledFeatures).toHaveLength(1)
        expect(result.styledFeatures[0].properties.color).toBe(
            unclassifiedColor
        )
        expect(result.styledFeatures[0].properties.iconUrl).toBeUndefined()
        expect(result.legend.items).toContainEqual(
            expect.objectContaining({
                name: 'Unclassified',
                color: unclassifiedColor,
            })
        )
    })

    it('should use custom name from unclassifiedLegend when provided', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: { hasAdditionalGeometry: false, dimensions: {} },
            },
        ]
        const groupSet = {
            id: 'gs1',
            name: 'GroupSet1',
            organisationUnitGroups: [
                {
                    id: 'g1',
                    name: 'Group1',
                    color: '#ff0000',
                    symbol: '21.png',
                },
            ],
        }
        const config = {
            radiusLow: 10,
            unclassifiedLegend: { color: '#cccccc', name: 'Unknown' },
        }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
        })

        expect(result.legend.items).toContainEqual(
            expect.objectContaining({ name: 'Unknown' })
        )
    })

    it('should always add Unclassified legend item when unclassifiedLegend is set, even if all features are matched', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: {
                    hasAdditionalGeometry: false,
                    dimensions: { gs1: 'g1' },
                },
            },
        ]
        const groupSet = {
            id: 'gs1',
            name: 'GroupSet1',
            organisationUnitGroups: [
                {
                    id: 'g1',
                    name: 'Group1',
                    color: '#ff0000',
                    symbol: '21.png',
                },
            ],
        }
        const config = {
            radiusLow: 10,
            unclassifiedLegend: { color: '#cccccc' },
        }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
        })

        expect(result.legend.items).toContainEqual(
            expect.objectContaining({ name: 'Unclassified', color: '#cccccc' })
        )
        expect(result.styledFeatures[0].properties.group).toBe('Group1')
    })

    it('should include unclassified orgunit with unclassifiedLegend color when set', () => {
        const unclassifiedColor = '#aabbcc'
        const features = [
            {
                geometry: { type: 'Polygon' },
                properties: { level: 1, dimensions: {} },
            },
        ]
        const groupSet = {
            id: 'gs1',
            name: 'GroupSet1',
            organisationUnitGroups: [
                { id: 'g1', name: 'Group1', color: '#ff0000' },
            ],
        }
        const config = {
            organisationUnitColor: 'red',
            radiusLow: 10,
            unclassifiedLegend: { color: unclassifiedColor },
        }
        const orgUnitLevels = { 1: 'Level1' }
        const result = getStyledOrgUnits({
            features,
            groupSet,
            config,
            baseUrl: '/baseUrl',
            orgUnitLevels,
        })

        expect(result.styledFeatures).toHaveLength(1)
        expect(result.styledFeatures[0].properties.color).toBe(
            unclassifiedColor
        )
        expect(result.legend.items).toContainEqual(
            expect.objectContaining({
                name: 'Unclassified',
                color: unclassifiedColor,
            })
        )
    })
})

describe('addGroupCountsToLegend', () => {
    it('should initialize all item counts to 0', () => {
        const legendItems = [
            { id: 'g1', count: 5 },
            { id: 'g2', count: 3 },
        ]
        addGroupCountsToLegend(legendItems, [], { id: 'gs1' })
        expect(legendItems[0].count).toBe(0)
        expect(legendItems[1].count).toBe(0)
    })

    it('should increment count for features matching a group', () => {
        const legendItems = [
            { id: 'g1', count: 0 },
            { id: 'g2', count: 0 },
        ]
        const features = [
            { properties: { dimensions: { gs1: 'g1' } } },
            { properties: { dimensions: { gs1: 'g1' } } },
            { properties: { dimensions: { gs1: 'g2' } } },
        ]
        addGroupCountsToLegend(legendItems, features, { id: 'gs1' })
        expect(legendItems[0].count).toBe(2)
        expect(legendItems[1].count).toBe(1)
    })

    it('should not increment count for features with no matching group', () => {
        const legendItems = [{ id: 'g1', count: 0 }]
        const features = [{ properties: { dimensions: { gs1: 'g99' } } }]
        addGroupCountsToLegend(legendItems, features, { id: 'gs1' })
        expect(legendItems[0].count).toBe(0)
    })

    it('should handle features with missing dimensions gracefully', () => {
        const legendItems = [{ id: 'g1', count: 0 }]
        const features = [
            { properties: {} },
            { properties: { dimensions: {} } },
        ]
        addGroupCountsToLegend(legendItems, features, { id: 'gs1' })
        expect(legendItems[0].count).toBe(0)
    })
})

describe('getOrgUnitsWithoutCoordsCount', () => {
    it('should return zero count immediately when orgUnitIds is empty', async () => {
        const result = await getOrgUnitsWithoutCoordsCount({
            engine: {},
            orgUnitIds: [],
            userId: 'user1',
            features: [],
        })
        expect(result).toEqual({ count: 0, missingOrgUnits: [] })
    })

    it('should return error when no data element is found', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValue({ dataElements: { dataElements: [] } }),
        }
        const result = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds: ['ou1'],
            userId: 'user1',
            features: [],
        })
        expect(result).toEqual({ error: true })
    })

    it('should count org units present in analytics but absent from features', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce({
                    dataElements: { dataElements: [{ id: 'de1' }] },
                })
                .mockResolvedValueOnce({
                    orgUnitsCount: {
                        metaData: {
                            dimensions: { ou: ['ou1', 'ou2', 'ou3'] },
                            items: {
                                ou1: { name: 'OU 1' },
                                ou2: { name: 'OU 2' },
                                ou3: { name: 'OU 3' },
                            },
                        },
                    },
                }),
        }
        const result = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds: ['ou1', 'ou2', 'ou3'],
            userId: 'user1',
            features: [{ id: 'ou1' }],
        })
        expect(result.count).toBe(2)
        expect(result.missingOrgUnits).toHaveLength(2)
        expect(result.missingOrgUnits.map((o) => o.id)).toEqual(['ou2', 'ou3'])
    })

    it('should return error when engine query throws', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Network error')),
        }
        const result = await getOrgUnitsWithoutCoordsCount({
            engine,
            orgUnitIds: ['ou1'],
            userId: 'user1',
            features: [],
        })
        expect(result).toEqual({ error: true })
    })
})

describe('fetchAndParseGroupSet', () => {
    it('should return parsed group set on success', async () => {
        const engine = {
            query: jest.fn().mockResolvedValue({
                groupSets: {
                    name: 'My Group Set',
                    organisationUnitGroups: [
                        {
                            id: 'g1',
                            name: 'Group 1',
                            color: '#ff0000',
                            symbol: '01.png',
                        },
                    ],
                },
            }),
        }
        const result = await fetchAndParseGroupSet(engine, { id: 'gs1' })
        expect(result).not.toBeNull()
        expect(result.name).toBe('My Group Set')
        expect(result.organisationUnitGroups).toHaveLength(1)
        expect(result.organisationUnitGroups[0].id).toBe('g1')
    })

    it('should return null when query fails', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Not found')),
        }
        const result = await fetchAndParseGroupSet(engine, { id: 'gs1' })
        expect(result).toBeNull()
    })
})

describe('addLevelCountsToLegend', () => {
    const levels = [
        { level: 1, displayName: 'National' },
        { level: 2, displayName: 'District' },
    ]

    it('should initialize all item counts to 0', () => {
        const legendItems = [
            { name: 'National', count: 5 },
            { name: 'District', count: 3 },
        ]
        addLevelCountsToLegend(legendItems, [], levels)
        expect(legendItems[0].count).toBe(0)
        expect(legendItems[1].count).toBe(0)
    })

    it('should increment count for features matching a level', () => {
        const legendItems = [
            { name: 'National', count: 0 },
            { name: 'District', count: 0 },
        ]
        const features = [
            { properties: { level: 1 } },
            { properties: { level: 2 } },
            { properties: { level: 2 } },
        ]
        addLevelCountsToLegend(legendItems, features, levels)
        expect(legendItems[0].count).toBe(1)
        expect(legendItems[1].count).toBe(2)
    })

    it('should not increment count for features with no matching level', () => {
        const legendItems = [{ name: 'National', count: 0 }]
        const features = [{ properties: { level: 99 } }]
        addLevelCountsToLegend(legendItems, features, levels)
        expect(legendItems[0].count).toBe(0)
    })
})

describe('loadGroupSetData', () => {
    it('should return null when includeGroupSets is false', async () => {
        const engine = { query: jest.fn() }
        const result = await loadGroupSetData(engine, {}, false)
        expect(result).toBeNull()
        expect(engine.query).not.toHaveBeenCalled()
    })

    it('should return null when groupSet already has organisationUnitGroups', async () => {
        const engine = { query: jest.fn() }
        const groupSet = { id: 'gs1', organisationUnitGroups: [] }
        const result = await loadGroupSetData(engine, groupSet, true)
        expect(result).toBeNull()
        expect(engine.query).not.toHaveBeenCalled()
    })

    it('should mutate groupSet and return null on success', async () => {
        const engine = {
            query: jest.fn().mockResolvedValue({
                groupSets: {
                    name: 'My Group Set',
                    organisationUnitGroups: [
                        { id: 'g1', name: 'Group 1', color: '#ff0000' },
                    ],
                },
            }),
        }
        const groupSet = { id: 'gs1' }
        const result = await loadGroupSetData(engine, groupSet, true)
        expect(result).toBeNull()
        expect(groupSet.name).toBe('My Group Set')
        expect(groupSet.organisationUnitGroups).toHaveLength(1)
    })

    it('should return an error string when query fails', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Not found')),
        }
        const groupSet = { id: 'gs1' }
        const result = await loadGroupSetData(engine, groupSet, true)
        expect(typeof result).toBe('string')
    })
})
