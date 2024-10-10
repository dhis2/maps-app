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
        const styleParams = { organisationUnitColor: 'red', radiusLow: 10 }
        const contextPath = '/contextPath'
        const result = getStyledOrgUnits(
            features,
            groupSet,
            styleParams,
            contextPath
        )

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

        const styleParams = { organisationUnitColor: 'red', radiusLow: 10 }

        const orgUnitLevels = {
            1: 'Level1',
            2: 'Level2',
            3: 'Level3',
            4: 'Level4',
        }

        const result = getStyledOrgUnits(
            features,
            groupSet,
            styleParams,
            '/contextPath',
            orgUnitLevels
        )

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
