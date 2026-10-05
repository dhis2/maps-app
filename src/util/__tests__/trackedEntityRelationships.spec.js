import {
    getDataWithRelationships,
    loadTrackedEntityRelationships,
} from '../trackedEntityRelationships.js'

const GEOMETRY = { coordinates: 'x/y' }

const rel = (relationship, from, to) => ({
    bidirectional: false,
    relationship,
    relationshipType: 'relationshipTypeId1',
    from: { trackedEntity: { trackedEntity: from } },
    to: { trackedEntity: { trackedEntity: to } },
})

const biRel = (relationship, from, to) => ({
    ...rel(relationship, from, to),
    bidirectional: true,
})

const instance = (id, relationships) => ({
    id,
    geometry: GEOMETRY,
    ...(relationships && { relationships }),
})

const teConstraint = (program) => ({
    relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
    trackedEntityType: { id: 'trackedEntityType1' },
    program: { id: program },
})

const teRelationshipType = (fromProgram, toProgram) => ({
    id: 'relationshipTypeId1',
    fromConstraint: teConstraint(fromProgram),
    toConstraint: teConstraint(toProgram),
})

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
        // Missing geometry
        { id: 'teFrom1', relationships: [] },
        // Missing relationships
        instance('teFrom2', []),
        // Wrong relationship type
        instance('teFrom3', [
            {
                relationship: 'relationship3',
                relationshipType: 'relationshipTypeId0',
            },
        ]),
        // Unidirectional relationship, TE is the target of the relationship, source is in another program
        instance('teFrom4', [rel('relationship4', 'teTo4', 'teFrom4')]),
        // Unidirectional relationship, target is in same program
        instance('teFrom5', [rel('relationship5', 'teFrom5', 'teTo5')]),
        // Bidirectional relationship, target is in same program
        instance('teFrom6', [biRel('relationship6', 'teTo6', 'teFrom6')]),
        // Bidirectional relationship, but target is in another program
        instance('teFrom7', [biRel('relationship7', 'teFrom7', 'teTo7')]),
        // Two unidirectional relationship, targets are in another program
        instance('teFrom8', [
            rel('relationship8A', 'teFrom8', 'teTo8A'),
            rel('relationship8B', 'teFrom8', 'teTo8B'),
        ]),
        // Two TE with single unidirectional relationship,
        // pointing at the same target in another program
        instance('teFrom9A', [biRel('relationship9A', 'teFrom9A', 'teTo9')]),
        instance('teFrom9B', [biRel('relationship9B', 'teFrom9B', 'teTo9')]),
        { id: 'teTo1', relationships: [] },
        instance('teTo2', []),
        instance('teTo3', []),
        instance('teTo5', []),
        instance('teTo6', [biRel('relationship6', 'teTo6', 'teFrom6')]),
    ]
    const mockTargetInstances = [
        { id: 'teTo1' },
        instance('teTo2'),
        instance('teTo3'),
        instance('teTo4', [rel('relationship4', 'teTo4', 'teFrom4')]),
        instance('teTo5'),
        instance('teTo6', [biRel('relationship6', 'teTo6', 'teFrom6')]),
        instance('teTo7', [biRel('relationship7', 'teFrom7', 'teTo7')]),
        instance('teTo8A', [rel('relationship8A', 'teFrom8', 'teTo8A')]),
        instance('teTo8B', [rel('relationship8B', 'teFrom8', 'teTo8B')]),
        instance('teTo9', [
            rel('relationship9A', 'teFrom9A', 'teTo9'),
            rel('relationship9B', 'teFrom9B', 'teTo9'),
        ]),
    ]
    const OUProps = {
        orgUnits: 'someOU',
        orgUnitsMode: 'someOUMode',
    }
    const expectedPrimary = [
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
    ]
    // Same TE type, different program: targets come from the program2 query
    const expectedOtherProgram = {
        primary: expectedPrimary,
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
    const expectProgram2Query = (engine) =>
        expect(engine.query).toHaveBeenCalledWith(
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
            serverVersion: { minor: 41 },
            instances: mockSourceInstances,
            queryOptions: { relationshipType, ...OUProps },
            engine: mockEngine,
        })
        // Tracked entities are still shown, without relationships
        expect(result.primary.length).toBeGreaterThan(0)
        expect(result.relationships).toEqual([])
        expect(result.secondary).toEqual([])
        expect(mockEngine.query).not.toHaveBeenCalled()
    })

    test('Same TE type and same program', async () => {
        const result = await getDataWithRelationships({
            serverVersion: { minor: 41 },
            instances: mockSourceInstances,
            queryOptions: {
                relationshipType: teRelationshipType('program1', 'program1'),
                ...OUProps,
            },
            engine: mockEngine,
        })

        expectResultToMatchExpected(result, {
            primary: expectedPrimary,
            relationships: ['relationship5', 'relationship6'],
            secondary: ['teFrom6', 'teTo5', 'teTo6'],
        })
        expect(mockEngine.query).not.toHaveBeenCalled()
    })

    test('Same TE type and different program', async () => {
        const result = await getDataWithRelationships({
            serverVersion: { minor: 41 },
            instances: mockSourceInstances,
            queryOptions: {
                relationshipType: teRelationshipType('program1', 'program2'),
                ...OUProps,
            },
            engine: mockEngine,
        })

        expectResultToMatchExpected(result, expectedOtherProgram)
        expectProgram2Query(mockEngine)
    })

    it.each([
        {
            trackerRootProp: 'instances',
            versionString: '2.40',
            serverVersion: { minor: 40 },
        },
        {
            trackerRootProp: 'trackedEntities',
            versionString: '2.41',
            serverVersion: { minor: 41 },
        },
    ])(
        '$versionString should use the tracker api root property "$trackerRootProp"',
        async ({ serverVersion, trackerRootProp }) => {
            mockEngine = {
                query: jest.fn().mockResolvedValue({
                    tei: { [trackerRootProp]: mockTargetInstances },
                }),
            }

            const result = await getDataWithRelationships({
                serverVersion,
                instances: mockSourceInstances,
                queryOptions: {
                    relationshipType: teRelationshipType(
                        'program1',
                        'program2'
                    ),
                    ...OUProps,
                },
                engine: mockEngine,
            })

            expectResultToMatchExpected(result, expectedOtherProgram)
            expectProgram2Query(mockEngine)
        }
    )
})

describe('loadTrackedEntityRelationships', () => {
    const constraint = {
        relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
        trackedEntityType: { id: 'teType' },
    }
    const relationshipType = {
        id: 'relType',
        displayName: 'Contact',
        fromConstraint: constraint,
        toConstraint: constraint,
    }
    const relatedEntityType = { displayName: 'Person', featureType: 'POINT' }
    const relationship = {
        relationship: 'rel1',
        relationshipType: 'relType',
        from: { trackedEntity: { trackedEntity: 'te1' } },
        to: { trackedEntity: { trackedEntity: 'te2' } },
    }
    const instances = [
        {
            id: 'te1',
            geometry: { type: 'Point', coordinates: [1, 2] },
            relationships: [relationship],
        },
        {
            id: 'te2',
            geometry: { type: 'Point', coordinates: [3, 4] },
            relationships: [relationship],
        },
    ]

    it('returns features, relationships and the types for the legend', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce({ relationshipType })
                .mockResolvedValueOnce({ relatedEntityType }),
        }

        const result = await loadTrackedEntityRelationships({
            config: { relationshipType: 'relType' },
            engine,
            serverVersion: { minor: 41 },
            instances,
            orgUnits: 'ou1',
        })

        // Same type and program on both sides: no extra instance query
        expect(engine.query).toHaveBeenCalledTimes(2)
        expect(result.relationshipType).toBe(relationshipType)
        expect(result.relatedEntityType).toBe(relatedEntityType)
        expect(result.data.map((f) => f.properties.id)).toEqual(['te1', 'te2'])
        expect(result.relationships.map((r) => r.id)).toEqual(['rel1'])
        expect(result.secondaryData.map((f) => f.properties.id)).toEqual([
            'te2',
        ])
    })
})
