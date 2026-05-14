import { getStyledOrgUnits } from '../orgUnits.js'

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
