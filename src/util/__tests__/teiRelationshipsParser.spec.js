import { apiFetch } from '../api.js'
import {
    fetchTEIs,
    getDataWithRelationships,
} from '../teiRelationshipsParser.js'

jest.mock('../api.js')

describe('fetchData', () => {
    it.each([
        {
            customProps: { organisationUnitSelectionMode: 'someOUMode' },
            expectedUrl:
                '/tracker/trackedEntities?skipPaging=true&fields=someFields&orgUnit=ouId&ouMode=someOUMode',
        },
        {
            customProps: { type: { id: 'someTETypeId' } },
            expectedUrl:
                '/tracker/trackedEntities?skipPaging=true&fields=someFields&orgUnit=ouId&trackedEntityType=someTETypeId',
        },
        {
            customProps: { program: 'someProgram' },
            expectedUrl:
                '/tracker/trackedEntities?skipPaging=true&fields=someFields&orgUnit=ouId&program=someProgram',
        },
    ])(
        'should call apiFetch correct url in different scenarios',
        async ({ customProps, expectedUrl }) => {
            const mockData = { some: 'object' }
            const baseProps = {
                orgUnits: 'ouId',
                fields: 'someFields',
            }

            apiFetch.mockResolvedValueOnce(mockData)
            const result = await fetchTEIs({
                ...baseProps,
                ...customProps,
            })
            expect(result).toEqual(mockData)
            expect(apiFetch).toHaveBeenCalledWith(expectedUrl)
        }
    )
})

describe('getDataWithRelationships', () => {
    let mockSourceInstances, mockTargetInstances, OUProps
    beforeAll(() => {
        mockSourceInstances = [
            {
                // Missing geometry
                id: 'teFrom1',
                relationships: [],
            },
            {
                // Missing relationships
                id: 'teFrom2',
                geometry: { coordinates: 'x/y' },
                relationships: [],
            },
            {
                // Wrong relationship type
                id: 'teFrom3',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        relationship: 'relationship3',
                        relationshipType: 'relationshipTypeId0',
                    },
                ],
            },
            {
                // Unidirectional relationship, TE is the target of the relationship, source is in another program
                id: 'teFrom4',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship4',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teTo4',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teFrom4',
                            },
                        },
                    },
                ],
            },
            {
                // Unidirectional relationship, target is in same program
                id: 'teFrom5',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship5',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom5',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo5',
                            },
                        },
                    },
                ],
            },
            {
                // Bidirectional relationship, target is in same program
                id: 'teFrom6',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship6',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teTo6',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teFrom6',
                            },
                        },
                    },
                ],
            },
            {
                // Bidirectional relationship, but target is in another program
                id: 'teFrom7',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship7',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom7',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo7',
                            },
                        },
                    },
                ],
            },
            {
                // Two unidirectional relationship, targets are in another program
                id: 'teFrom8',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship8A',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom8',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo8A',
                            },
                        },
                    },
                    {
                        bidirectional: false,
                        relationship: 'relationship8B',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom8',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo8B',
                            },
                        },
                    },
                ],
            },
            {
                // Two TE with single unidirectional relationship,
                // pointing at the same target in another program
                id: 'teFrom9A',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship9A',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom9A',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo9',
                            },
                        },
                    },
                ],
            },
            {
                // Two TE with single unidirectional relationship,
                // pointing at the same target in another program
                id: 'teFrom9B',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship9B',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom9B',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo9',
                            },
                        },
                    },
                ],
            },
            { id: 'teTo1', relationships: [] },
            {
                id: 'teTo2',
                geometry: { coordinates: 'x/y' },
                relationships: [],
            },
            {
                id: 'teTo3',
                geometry: { coordinates: 'x/y' },
                relationships: [],
            },
            {
                id: 'teTo5',
                geometry: { coordinates: 'x/y' },
                relationships: [],
            },
            {
                id: 'teTo6',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship6',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teTo6',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teFrom6',
                            },
                        },
                    },
                ],
            },
        ]
        mockTargetInstances = [
            { id: 'teTo1' },
            { id: 'teTo2', geometry: { coordinates: 'x/y' } },
            { id: 'teTo3', geometry: { coordinates: 'x/y' } },
            {
                id: 'teTo4',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship4',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teTo4',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teFrom4',
                            },
                        },
                    },
                ],
            },
            { id: 'teTo5', geometry: { coordinates: 'x/y' } },
            {
                id: 'teTo6',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship6',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teTo6',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teFrom6',
                            },
                        },
                    },
                ],
            },
            {
                id: 'teTo7',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: true,
                        relationship: 'relationship7',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom7',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo7',
                            },
                        },
                    },
                ],
            },
            {
                id: 'teTo8A',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship8A',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom8',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo8A',
                            },
                        },
                    },
                ],
            },
            {
                id: 'teTo8B',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship8B',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom8',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo8B',
                            },
                        },
                    },
                ],
            },
            {
                id: 'teTo9',
                geometry: { coordinates: 'x/y' },
                relationships: [
                    {
                        bidirectional: false,
                        relationship: 'relationship9A',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom9A',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo9',
                            },
                        },
                    },
                    {
                        bidirectional: false,
                        relationship: 'relationship9B',
                        relationshipType: 'relationshipTypeId1',
                        from: {
                            trackedEntity: {
                                trackedEntity: 'teFrom9B',
                            },
                        },
                        to: {
                            trackedEntity: {
                                trackedEntity: 'teTo9',
                            },
                        },
                    },
                ],
            },
        ]
        OUProps = {
            orgUnits: 'someOU',
            organisationUnitSelectionMode: 'someOUMode',
        }
    })
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it.each([
        {
            // To relationshipEntity not supported
            relationshipType: {
                fromConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE', // Selection starts from TE type, so this should not change
                },
                toConstraint: {
                    relationshipEntity: 'PROGRAM_INSTANCE', // PROGRAM_INSTANCE & PROGRAM_STAGE_INSTANCE are not supported
                },
            },
            expected: [], // This the current behavior but it should be revised
        },
        {
            // Same TE type and same program
            relationshipType: {
                id: 'relationshipTypeId1',
                fromConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program1',
                    },
                },
                toConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program1',
                    },
                },
            },
            expected: {
                primary: [
                    'teFrom2',
                    'teFrom3',
                    'teFrom4',
                    'teFrom5',
                    'teFrom6',
                    'teFrom7',
                    'teFrom8',
                    'teFrom9A',
                    'teFrom9B',
                    'teTo2',
                    'teTo3',
                    'teTo5',
                    'teTo6',
                ],
                relationships: ['relationship5', 'relationship6'],
                secondary: ['teFrom6', 'teTo5', 'teTo6'],
            },
        },
        {
            // Same TE type but different program
            // Different TE type and different program - would be the same given we mock the API call
            relationshipType: {
                id: 'relationshipTypeId1',
                fromConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program1',
                    },
                },
                toConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program2',
                    },
                },
            },
            expected: {
                primary: [
                    'teFrom2',
                    'teFrom3',
                    'teFrom4',
                    'teFrom5',
                    'teFrom6',
                    'teFrom7',
                    'teFrom8',
                    'teFrom9A',
                    'teFrom9B',
                    'teTo2',
                    'teTo3',
                    'teTo5',
                    'teTo6',
                ],
                relationships: [
                    'relationship5',
                    'relationship6',
                    'relationship7',
                    'relationship8A',
                    'relationship8B',
                    'relationship9A',
                    'relationship9B',
                ],
                secondary: [
                    'teTo5',
                    'teTo6',
                    'teTo7',
                    'teTo8A',
                    'teTo8B',
                    'teTo9',
                ],
            },
        },
    ])(
        'should return an object with primary, relationships and secondary properties',
        async ({ relationshipType, expected }) => {
            const serverVersion = {
                major: 2,
                minor: 41,
            }

            apiFetch.mockResolvedValueOnce({
                trackedEntities: mockTargetInstances,
            })
            const result = await getDataWithRelationships(
                serverVersion,
                mockSourceInstances,
                { relationshipType, ...OUProps }
            )

            if (Array.isArray(expected)) {
                expect(result).toEqual(expected)
            } else {
                expect(result).toHaveProperty('primary')
                console.log('primary', result.primary)
                expect(result).toHaveProperty('relationships')
                console.log('relationships', result.relationships)
                expect(result).toHaveProperty('secondary')
                console.log('secondary', result.secondary)

                const resultPrimaryIds = result.primary.map((item) => item.id)
                expect(resultPrimaryIds.sort()).toEqual(expected.primary.sort())
                const resultRelationshipsIds = result.relationships.map(
                    (item) => item.id
                )
                expect(resultRelationshipsIds.sort()).toEqual(
                    expected.relationships.sort()
                )
                const resultSecondaryIds = result.secondary.map(
                    (item) => item.id
                )
                expect(resultSecondaryIds.sort()).toEqual(
                    expected.secondary.sort()
                )
            }
        }
    )

    it.each([
        {
            serverVersion: {
                major: 2,
                minor: 40,
            },
            trackerRootProp: 'instances',
        },
        {
            serverVersion: {
                major: 2,
                minor: 41,
            },
            trackerRootProp: 'trackedEntities',
        },
        {
            serverVersion: {
                major: 2,
                minor: 42,
            },
            trackerRootProp: 'trackedEntities',
        },
    ])(
        'should use the tracker api root property corresponding to the server version',
        async ({ serverVersion, trackerRootProp }) => {
            const relationshipType = {
                id: 'relationshipTypeId1',
                fromConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program1',
                    },
                },
                toConstraint: {
                    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
                    trackedEntityType: {
                        id: 'trackedEntityType1',
                    },
                    program: {
                        id: 'program2',
                    },
                },
            }
            const expected = {
                primary: [
                    'teFrom2',
                    'teFrom3',
                    'teFrom4',
                    'teFrom5',
                    'teFrom6',
                    'teFrom7',
                    'teFrom8',
                    'teFrom9A',
                    'teFrom9B',
                    'teTo2',
                    'teTo3',
                    'teTo5',
                    'teTo6',
                ],
                relationships: [
                    'relationship5',
                    'relationship6',
                    'relationship7',
                    'relationship8A',
                    'relationship8B',
                    'relationship9A',
                    'relationship9B',
                ],
                secondary: [
                    'teTo5',
                    'teTo6',
                    'teTo7',
                    'teTo8A',
                    'teTo8B',
                    'teTo9',
                ],
            }

            const mockData = {
                [trackerRootProp]: mockTargetInstances,
            }

            jest.clearAllMocks()
            apiFetch.mockResolvedValueOnce(mockData)
            const result = await getDataWithRelationships(
                serverVersion,
                mockSourceInstances,
                { relationshipType, ...OUProps }
            )

            if (Array.isArray(expected)) {
                expect(result).toEqual(expected)
            } else {
                expect(result).toHaveProperty('primary')
                //console.log('primary', result.primary)
                expect(result).toHaveProperty('relationships')
                //console.log('relationships', result.relationships)
                expect(result).toHaveProperty('secondary')
                //console.log('secondary', result.secondary)

                const resultPrimaryIds = result.primary.map((item) => item.id)
                expect(resultPrimaryIds.sort()).toEqual(expected.primary.sort())
                const resultRelationshipsIds = result.relationships.map(
                    (item) => item.id
                )
                expect(resultRelationshipsIds.sort()).toEqual(
                    expected.relationships.sort()
                )
                const resultSecondaryIds = result.secondary.map(
                    (item) => item.id
                )
                expect(resultSecondaryIds.sort()).toEqual(
                    expected.secondary.sort()
                )
            }
        }
    )
})
