import { getDataWithRelationships } from '../teiRelationshipsParser.js'

const expectResultToMatchExpected = (result, expected) => {
    expect(result).toHaveProperty('primary')
    expect(result).toHaveProperty('relationships')
    expect(result).toHaveProperty('secondary')

    const resultPrimaryIds = result.primary.map((item) => item.id)
    expect(resultPrimaryIds.sort()).toEqual(expected.primary.sort())
    const resultRelationshipsIds = result.relationships.map((item) => item.id)
    expect(resultRelationshipsIds.sort()).toEqual(expected.relationships.sort())
    const resultSecondaryIds = result.secondary.map((item) => item.id)
    expect(resultSecondaryIds.sort()).toEqual(expected.secondary.sort())
}

describe('getDataWithRelationships', () => {
    const mockSourceInstances = [
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
    const mockTargetInstances = [
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
    const OUProps = {
        orgUnits: 'someOU',
        orgUnitsMode: 'someOUMode',
    }
    let mockEngine

    beforeEach(() => {
        jest.resetAllMocks()

        mockEngine = {
            query: jest.fn().mockResolvedValue({
                tei: { trackedEntities: mockTargetInstances },
            }),
        }
    })

    test('To relationshipEntity not supported', async () => {
        const relationshipType = {
            fromConstraint: {
                relationshipEntity: 'TRACKED_ENTITY_INSTANCE', // Selection starts from TE type, so this should not change
            },
            toConstraint: {
                relationshipEntity: 'PROGRAM_INSTANCE', // PROGRAM_INSTANCE & PROGRAM_STAGE_INSTANCE are not supported
            },
        }

        const result = await getDataWithRelationships({
            isVersion40: false,
            instances: mockSourceInstances,
            queryOptions: { relationshipType, ...OUProps },
            engine: mockEngine,
        })
        expect(result).toEqual([]) // This the current behavior but it should be revised
        expect(mockEngine.query).not.toHaveBeenCalled()
    })

    test('Same TE type and same program', async () => {
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
                    id: 'program1',
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
            relationships: ['relationship5', 'relationship6'],
            secondary: ['teFrom6', 'teTo5', 'teTo6'],
        }

        const result = await getDataWithRelationships({
            isVersion40: false,
            instances: mockSourceInstances,
            queryOptions: { relationshipType, ...OUProps },
            engine: mockEngine,
        })

        expectResultToMatchExpected(result, expected)

        expect(mockEngine.query).not.toHaveBeenCalled()
    })

    test('Same TE type and different program', async () => {
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
            secondary: ['teTo5', 'teTo6', 'teTo7', 'teTo8A', 'teTo8B', 'teTo9'],
        }
        const result = await getDataWithRelationships({
            isVersion40: false,
            instances: mockSourceInstances,
            queryOptions: { relationshipType, ...OUProps },
            engine: mockEngine,
        })

        expectResultToMatchExpected(result, expected)

        expect(mockEngine.query).toHaveBeenCalledWith(
            {
                tei: {
                    resource: 'tracker/trackedEntities',
                    params: expect.anything(),
                },
            },
            expect.objectContaining({
                variables: {
                    fields: [
                        'trackedEntity~rename(id)',
                        'geometry',
                        'relationships',
                    ],
                    orgUnits: 'someOU',
                    orgUnitMode: undefined,
                    program: 'program2',
                    trackedEntityType: undefined,
                },
            })
        )
    })

    it.each([
        {
            trackerRootProp: 'instances',
            versionString: '2.40',
            isVersion40: true,
        },
        {
            trackerRootProp: 'trackedEntities',
            versionString: '2.41',
            isVersion40: false,
        },
    ])(
        '$versionString should use the tracker api root property "$trackerRootProp" and resource "$resource"',
        async ({ isVersion40, trackerRootProp }) => {
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
                tei: { [trackerRootProp]: mockTargetInstances },
            }

            mockEngine = {
                query: jest.fn().mockResolvedValue(mockData),
            }

            const result = await getDataWithRelationships({
                isVersion40,
                instances: mockSourceInstances,
                queryOptions: { relationshipType, ...OUProps },
                engine: mockEngine,
            })

            expectResultToMatchExpected(result, expected)
            expect(mockEngine.query).toHaveBeenCalledWith(
                {
                    tei: {
                        resource: 'tracker/trackedEntities',
                        params: expect.anything(),
                    },
                },
                expect.objectContaining({
                    variables: {
                        fields: [
                            'trackedEntity~rename(id)',
                            'geometry',
                            'relationships',
                        ],
                        orgUnits: 'someOU',
                        orgUnitMode: undefined,
                        program: 'program2',
                        trackedEntityType: undefined,
                    },
                })
            )
        }
    )
})

describe('getDataWithRelationships target query', () => {
    // `program` is left out, not undefined: the code checks 'program' in to
    const constraint = ({ type = 'type1', program } = {}) => ({
        relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
        trackedEntityType: { id: type },
        ...(program && { program: { id: program } }),
    })

    const instance = {
        id: 'te1',
        geometry: { type: 'Point', coordinates: [1, 2] },
        relationships: [
            {
                relationship: 'relationship1',
                relationshipType: 'relationshipTypeId1',
                from: { trackedEntity: { trackedEntity: 'te1' } },
                to: { trackedEntity: { trackedEntity: 'te2' } },
            },
        ],
    }

    it.each([
        {
            name: 'same type, different programs, to program set',
            from: { program: 'program1' },
            to: { program: 'program2' },
            query: { program: 'program2', trackedEntityType: undefined },
        },
        {
            name: 'same type, different programs, no to program',
            from: { program: 'program1' },
            to: {},
            query: { program: undefined, trackedEntityType: 'type1' },
        },
        {
            name: 'different types, different programs, to program set',
            from: { program: 'program1' },
            to: { type: 'type2', program: 'program2' },
            query: { program: undefined, trackedEntityType: 'type2' },
        },
        {
            name: 'different types, different programs, no to program',
            from: { program: 'program1' },
            to: { type: 'type2' },
            query: { program: undefined, trackedEntityType: 'type2' },
        },
        {
            name: 'different types, same program',
            from: { program: 'program1' },
            to: { type: 'type2', program: 'program1' },
            query: { program: undefined, trackedEntityType: undefined },
        },
        {
            name: 'different types, no programs',
            from: {},
            to: { type: 'type2' },
            query: { program: undefined, trackedEntityType: undefined },
        },
        {
            name: 'same type, same program',
            from: { program: 'program1' },
            to: { program: 'program1' },
            query: null,
        },
        {
            name: 'same type, no programs',
            from: {},
            to: {},
            query: null,
        },
    ])('$name', async ({ from, to, query }) => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValue({ tei: { trackedEntities: [] } }),
        }

        await getDataWithRelationships({
            isVersion40: false,
            instances: [instance],
            queryOptions: {
                relationshipType: {
                    id: 'relationshipTypeId1',
                    fromConstraint: constraint(from),
                    toConstraint: constraint(to),
                },
                orgUnits: 'ou1',
            },
            engine,
        })

        if (query) {
            const [[{ tei }, { variables }]] = engine.query.mock.calls
            expect(tei.params(variables)).toMatchObject(query)
        } else {
            // The targets are among the loaded instances
            expect(engine.query).not.toHaveBeenCalled()
        }
    })

    it.each([
        {
            version: '2.40',
            isVersion40: true,
            root: 'instances',
            orgUnits: 'ou1;ou2',
            params: {
                orgUnit: 'ou1;ou2',
                ouMode: 'DESCENDANTS',
                skipPaging: true,
            },
        },
        {
            version: '2.41',
            isVersion40: false,
            root: 'trackedEntities',
            orgUnits: 'ou1,ou2',
            params: {
                orgUnits: 'ou1,ou2',
                orgUnitMode: 'DESCENDANTS',
                paging: false,
            },
        },
    ])(
        'requests the related tracked entities on $version',
        async ({ isVersion40, root, orgUnits, params }) => {
            const engine = {
                query: jest.fn().mockResolvedValue({ tei: { [root]: [] } }),
            }

            await getDataWithRelationships({
                isVersion40,
                instances: [instance],
                queryOptions: {
                    relationshipType: {
                        id: 'relationshipTypeId1',
                        fromConstraint: constraint({ program: 'program1' }),
                        toConstraint: constraint({ program: 'program2' }),
                    },
                    orgUnits,
                    organisationUnitSelectionMode: 'DESCENDANTS',
                },
                engine,
            })

            const [[{ tei }, { variables }]] = engine.query.mock.calls
            expect(tei.resource).toBe('tracker/trackedEntities')
            expect(tei.params(variables)).toEqual({
                fields: [
                    'trackedEntity~rename(id)',
                    'geometry',
                    'relationships',
                ],
                program: 'program2',
                ...params,
            })
        }
    )
})
