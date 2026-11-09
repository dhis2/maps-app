import {
    FIRST_DATA_ELEMENT_QUERY,
    ORG_UNITS_COUNT_QUERY,
    ORG_UNITS_PATHS_QUERY,
} from '../../util/requests.js'
import { applyMissingCoordsCount } from '../facilityLoader.js'

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
    test('attaches org unit path, own name and level to facilities missing a point location', async () => {
        const engine = makeEngine({
            missingOuIds: ['fac2'],
            ouNamesById: { fac2: 'Tihun CHC' },
            orgUnitPathsById: { fac2: '/country1/region1/fac2' },
        })
        const config = {}
        const legend = {}

        await applyMissingCoordsCount(config, {
            engine,
            orgUnitIds: ['fac1', 'fac2'],
            userId: 'user1',
            features: [{ id: 'fac1' }],
            legend,
            alerts: [],
        })

        expect(legend.orgUnitsWithoutCoordinatesCount).toBe(1)
        expect(legend.orgUnitsPointOnly).toBe(true)
        expect(config.dataWithoutCoords).toEqual([
            {
                id: 'fac2',
                properties: {
                    id: 'fac2',
                    name: 'Tihun CHC',
                    orgUnitId: 'fac2',
                    orgUnitPath: '/country1/region1/fac2',
                    orgUnitOwn: '/country1/region1/fac2',
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
            orgUnitIds: ['fac1'],
            userId: 'user1',
            features: [{ id: 'fac1' }],
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
            orgUnitIds: ['fac1'],
            userId: 'user1',
            features: [],
            legend,
            alerts,
        })

        expect(config.dataWithoutCoords).toBeUndefined()
        expect(alerts).toEqual([
            expect.objectContaining({
                message: 'Could not count org units without a point location',
            }),
        ])
    })
})
