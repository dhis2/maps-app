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
                '/trackedEntityInstances?skipPaging=true&fields=someFields&ou=ouId&ouMode=someOUMode',
        },
        {
            customProps: { type: { id: 'someTETypeId' } },
            expectedUrl:
                '/trackedEntityInstances?skipPaging=true&fields=someFields&ou=ouId&trackedEntityType=someTETypeId',
        },
        {
            customProps: { program: 'someProgram' },
            expectedUrl:
                '/trackedEntityInstances?skipPaging=true&fields=someFields&ou=ouId&program=someProgram',
        },
    ])(
        'should call apiFetch correct url in different scenarios',
        async ({ customProps, expectedUrl }) => {
            const placeholder = { some: 'object' }
            const mockData = { trackedEntityInstances: placeholder }
            const baseProps = {
                orgUnits: 'ouId',
                fields: 'someFields',
            }

            apiFetch.mockResolvedValueOnce(mockData)
            const result = await fetchTEIs({
                ...baseProps,
                ...customProps,
            })
            expect(result).toEqual(placeholder)
            expect(apiFetch).toHaveBeenCalledWith(expectedUrl)
        }
    )
})

describe('getDataWithRelationships', () => {
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
            const mockSourceInstances = [
                {
                    // Missing coordinates
                    id: 'teFrom1',
                    relationships: [],
                },
                {
                    // Missing relationships
                    id: 'teFrom2',
                    coordinates: 'x/y',
                    relationships: [],
                },
                {
                    // Wrong relationship type
                    id: 'teFrom3',
                    coordinates: 'x/y',
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
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship4',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo4',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom4',
                                },
                            },
                        },
                    ],
                },
                {
                    // Unidirectional relationship, target is in same program
                    id: 'teFrom5',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship5',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom5',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo5',
                                },
                            },
                        },
                    ],
                },
                {
                    // Bidirectional relationship, target is in same program
                    id: 'teFrom6',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship6',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo6',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom6',
                                },
                            },
                        },
                    ],
                },
                {
                    // Bidirectional relationship, but target is in another program
                    id: 'teFrom7',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship7',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom7',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo7',
                                },
                            },
                        },
                    ],
                },
                {
                    // Two unidirectional relationship, targets are in another program
                    id: 'teFrom8',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship8A',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom8',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo8A',
                                },
                            },
                        },
                        {
                            bidirectional: false,
                            relationship: 'relationship8B',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom8',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo8B',
                                },
                            },
                        },
                    ],
                },
                {
                    // Two TE with single unidirectional relationship,
                    // pointing at the same target in another program
                    id: 'teFrom9A',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship9A',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom9A',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo9',
                                },
                            },
                        },
                    ],
                },
                {
                    // Two TE with single unidirectional relationship,
                    // pointing at the same target in another program
                    id: 'teFrom9B',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship9B',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom9B',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo9',
                                },
                            },
                        },
                    ],
                },
                { id: 'teTo1', relationships: [] },
                { id: 'teTo2', coordinates: 'x/y', relationships: [] },
                { id: 'teTo3', coordinates: 'x/y', relationships: [] },
                { id: 'teTo5', coordinates: 'x/y', relationships: [] },
                {
                    id: 'teTo6',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship6',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo6',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom6',
                                },
                            },
                        },
                    ],
                },
            ]
            const mockTargetInstances = [
                { id: 'teTo1' },
                { id: 'teTo2', coordinates: 'x/y' },
                { id: 'teTo3', coordinates: 'x/y' },
                {
                    id: 'teTo4',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship4',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo4',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom4',
                                },
                            },
                        },
                    ],
                },
                { id: 'teTo5', coordinates: 'x/y' },
                {
                    id: 'teTo6',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship6',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo6',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom6',
                                },
                            },
                        },
                    ],
                },
                {
                    id: 'teTo7',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: true,
                            relationship: 'relationship7',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom7',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo7',
                                },
                            },
                        },
                    ],
                },
                {
                    id: 'teTo8A',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship8A',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom8',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo8A',
                                },
                            },
                        },
                    ],
                },
                {
                    id: 'teTo8B',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship8B',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom8',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo8B',
                                },
                            },
                        },
                    ],
                },
                {
                    id: 'teTo9',
                    coordinates: 'x/y',
                    relationships: [
                        {
                            bidirectional: false,
                            relationship: 'relationship9A',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom9A',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo9',
                                },
                            },
                        },
                        {
                            bidirectional: false,
                            relationship: 'relationship9B',
                            relationshipType: 'relationshipTypeId1',
                            from: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teFrom9B',
                                },
                            },
                            to: {
                                trackedEntityInstance: {
                                    trackedEntityInstance: 'teTo9',
                                },
                            },
                        },
                    ],
                },
            ]
            const OUProps = {
                orgUnits: 'someOU',
                organisationUnitSelectionMode: 'someOUMode',
            }

            apiFetch.mockResolvedValueOnce({
                trackedEntityInstances: mockTargetInstances,
            })
            const result = await getDataWithRelationships(
                mockSourceInstances,
                relationshipType,
                OUProps
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
})
