import {
    getStyledOrgUnits,
    addGroupCountsToLegend,
    getOrgUnitsWithoutCoordsCount,
    fetchAndParseGroupSet,
} from '../orgUnits.js'

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
