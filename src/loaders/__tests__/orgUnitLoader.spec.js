import { WARNING_NO_OU_COORD } from '../../constants/alerts.js'
import {
    FIRST_DATA_ELEMENT_QUERY,
    GEOFEATURES_QUERY,
    ORG_UNITS_COUNT_QUERY,
    ORG_UNITS_PATHS_QUERY,
} from '../../util/requests.js'
import orgUnitLoader, { applyMissingCoordsCount } from '../orgUnitLoader.js'

const makeEngine = ({
    missingOuIds = [],
    ouNamesById = {},
    orgUnitPathsById = {},
} = {}) => ({
    query: jest.fn((query, { variables } = {}) => {
        if (query === FIRST_DATA_ELEMENT_QUERY) {
            return Promise.resolve({
                dataElements: { dataElements: [{ id: 'de1' }] },
            })
        }
        if (query === ORG_UNITS_COUNT_QUERY) {
            return Promise.resolve({
                orgUnitsCount: {
                    metaData: {
                        dimensions: { ou: missingOuIds },
                        items: Object.fromEntries(
                            missingOuIds.map((id) => [
                                id,
                                { name: ouNamesById[id] ?? id },
                            ])
                        ),
                    },
                },
            })
        }
        if (query === ORG_UNITS_PATHS_QUERY) {
            const requestedIds = variables.ids.split(',')
            return Promise.resolve({
                organisationUnits: {
                    organisationUnits: requestedIds
                        .filter((id) => orgUnitPathsById[id])
                        .map((id) => ({ id, path: orgUnitPathsById[id] })),
                },
            })
        }
        throw new Error('Unexpected query')
    }),
})

describe('applyMissingCoordsCount', () => {
    test('attaches org unit path, own name and level to org units missing coordinates', async () => {
        const engine = makeEngine({
            missingOuIds: ['ou2'],
            ouNamesById: { ou2: 'District B' },
            orgUnitPathsById: { ou2: '/country1/region1/ou2' },
        })
        const config = {}
        const legend = {}

        await applyMissingCoordsCount(config, {
            engine,
            orgUnitIds: ['ou1', 'ou2'],
            userId: 'user1',
            features: [{ id: 'ou1' }],
            legend,
            alerts: [],
        })

        expect(legend.orgUnitsWithoutCoordinatesCount).toBe(1)
        expect(config.dataWithoutCoords).toEqual([
            {
                id: 'ou2',
                properties: {
                    id: 'ou2',
                    name: 'District B',
                    orgUnitId: 'ou2',
                    orgUnitPath: '/country1/region1/ou2',
                    orgUnitOwn: '/country1/region1/ou2',
                    level: 3,
                },
            },
        ])
    })

    test('does not set dataWithoutCoords when nothing is missing', async () => {
        const engine = makeEngine({ missingOuIds: [] })
        const config = {}
        const legend = {}

        await applyMissingCoordsCount(config, {
            engine,
            orgUnitIds: ['ou1'],
            userId: 'user1',
            features: [{ id: 'ou1' }],
            legend,
            alerts: [],
        })

        expect(legend.orgUnitsWithoutCoordinatesCount).toBe(0)
        expect(config.dataWithoutCoords).toBeUndefined()
    })

    test('pushes an alert and leaves dataWithoutCoords unset when the count query fails', async () => {
        const engine = {
            query: jest.fn().mockRejectedValue(new Error('Network error')),
        }
        const config = {}
        const legend = {}
        const alerts = []

        await applyMissingCoordsCount(config, {
            engine,
            orgUnitIds: ['ou1'],
            userId: 'user1',
            features: [],
            legend,
            alerts,
        })

        expect(config.dataWithoutCoords).toBeUndefined()
        expect(alerts).toEqual([
            expect.objectContaining({
                message: 'Could not count org units without coordinates',
            }),
        ])
    })
})

// A minimal engine covering every query the full orgUnitLoader issues -
// GEOFEATURES_QUERY, the org unit levels lookup, and (when
// countFeaturesWithoutCoordinates is in effect) the missing-org-units
// count/path queries already exercised above via applyMissingCoordsCount.
const makeFullLoaderEngine = ({
    missingOuIds = [],
    ouNamesById = {},
    orgUnitPathsById = {},
} = {}) => ({
    query: jest.fn((query) => {
        if (query === GEOFEATURES_QUERY) {
            return Promise.resolve({ geoFeatures: [] })
        }
        if (query?.orgUnitLevels) {
            return Promise.resolve({
                orgUnitLevels: { organisationUnitLevels: [] },
            })
        }
        if (query === FIRST_DATA_ELEMENT_QUERY) {
            return Promise.resolve({
                dataElements: { dataElements: [{ id: 'de1' }] },
            })
        }
        if (query === ORG_UNITS_COUNT_QUERY) {
            return Promise.resolve({
                orgUnitsCount: {
                    metaData: {
                        dimensions: { ou: missingOuIds },
                        items: Object.fromEntries(
                            missingOuIds.map((id) => [
                                id,
                                { name: ouNamesById[id] ?? id },
                            ])
                        ),
                    },
                },
            })
        }
        if (query === ORG_UNITS_PATHS_QUERY) {
            return Promise.resolve({
                organisationUnits: {
                    organisationUnits: Object.entries(orgUnitPathsById).map(
                        ([id, path]) => ({ id, path })
                    ),
                },
            })
        }
        throw new Error('Unexpected query')
    }),
})

const referenceLayerConfig = () => ({
    id: 'ref1',
    layer: 'combinedTableRef',
    rows: [{ dimension: 'ou', items: [{ id: 'ou1' }] }],
})

const orgUnitLayerConfig = () => ({
    id: 'orgunit1',
    layer: 'orgUnit',
    rows: [{ dimension: 'ou', items: [{ id: 'ou1' }] }],
})

const loadArgs = (config, engine) => ({
    config,
    engine,
    keyAnalysisDisplayProperty: 'name',
    userId: 'user1',
    baseUrl: '',
})

describe('orgUnitLoader - reference layer org units without coordinates', () => {
    test('always loads org units without coordinates for the reference layer, even though it is never explicitly configured to', async () => {
        const engine = makeFullLoaderEngine({
            missingOuIds: ['ou1'],
            ouNamesById: { ou1: 'Country 1' },
            orgUnitPathsById: { ou1: '/ou1' },
        })

        const result = await orgUnitLoader(
            loadArgs(referenceLayerConfig(), engine)
        )

        expect(result.countFeaturesWithoutCoordinates).toBe(true)
        expect(result.dataWithoutCoords).toEqual([
            {
                id: 'ou1',
                properties: {
                    id: 'ou1',
                    name: 'Country 1',
                    orgUnitId: 'ou1',
                    orgUnitPath: '/ou1',
                    orgUnitOwn: '/ou1',
                    level: 1,
                },
            },
        ])
    })

    test('does not push the generic "no coordinates" warning for the reference layer, even when every org unit lacks geometry', async () => {
        const engine = makeFullLoaderEngine({
            missingOuIds: ['ou1'],
            ouNamesById: { ou1: 'Country 1' },
            orgUnitPathsById: { ou1: '/ou1' },
        })

        const result = await orgUnitLoader(
            loadArgs(referenceLayerConfig(), engine)
        )

        expect(result.alerts).not.toContainEqual(
            expect.objectContaining({ code: WARNING_NO_OU_COORD })
        )
    })

    test('a regular org unit layer is unaffected - still needs the checkbox-derived flag to load org units without coordinates, and still warns when none have coordinates', async () => {
        const engine = makeFullLoaderEngine({
            missingOuIds: ['ou1'],
            ouNamesById: { ou1: 'Country 1' },
            orgUnitPathsById: { ou1: '/ou1' },
        })

        const result = await orgUnitLoader(
            loadArgs(orgUnitLayerConfig(), engine)
        )

        expect(result.countFeaturesWithoutCoordinates).toBeUndefined()
        expect(result.dataWithoutCoords).toBeUndefined()
        expect(result.alerts).toContainEqual(
            expect.objectContaining({ code: WARNING_NO_OU_COORD })
        )
    })
})
