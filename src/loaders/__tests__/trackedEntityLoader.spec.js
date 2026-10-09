import trackedEntityLoader, { parseJsonConfig } from '../trackedEntityLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

describe('parseJsonConfig', () => {
    it('extracts periodType when relationships is null', () => {
        const config = {
            config: JSON.stringify({
                relationships: null,
                periodType: 'program',
            }),
        }
        parseJsonConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })

    it('extracts both periodType and relationship fields when relationships is set', () => {
        const config = {
            config: JSON.stringify({
                relationships: {
                    type: 'rel-type-id',
                    pointColor: '#ff0000',
                    pointRadius: 5,
                    lineColor: '#0000ff',
                    relationshipOutsideProgram: true,
                },
                periodType: 'program',
            }),
        }
        parseJsonConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBe('rel-type-id')
        expect(config.relatedPointColor).toBe('#ff0000')
        expect(config.relatedPointRadius).toBe(5)
        expect(config.relationshipLineColor).toBe('#0000ff')
        expect(config.relationshipOutsideProgram).toBe(true)
        expect(config.config).toBeUndefined()
    })

    it('does nothing when config.config is absent', () => {
        const config = { layer: 'trackedEntity' }
        parseJsonConfig(config)
        expect(config).toEqual({ layer: 'trackedEntity' })
    })

    it('does not throw and leaves config intact on malformed JSON', () => {
        const config = { config: 'not-valid-json' }
        expect(() => parseJsonConfig(config)).not.toThrow()
        expect(config.periodType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })
})

const v40 = { major: 2, minor: 40, patch: 0 }
const v41 = { major: 2, minor: 41, patch: 0 }
const v42 = { major: 2, minor: 42, patch: 0 }

const trackedEntityType = { id: 'teType1', name: 'Person' }
const program = { id: 'program1', name: 'Malaria case' }

const baseConfig = {
    id: 'layer1',
    layer: 'trackedEntity',
    trackedEntityType,
    rows: [
        {
            dimension: 'ou',
            items: [{ id: 'ou1' }, { id: 'ou2' }],
        },
    ],
    organisationUnitSelectionMode: 'DESCENDANTS',
    startDate: '2024-01-01T00:00:00.000',
    endDate: '2024-12-31T00:00:00.000',
}

const point = (id, coordinates = [1, 2]) => ({
    id,
    geometry: { type: 'Point', coordinates },
})

// The request the data engine sends: resource and final URL params
const getRequest = (engine, call = 0) => {
    const [query, { variables }] = engine.query.mock.calls[call]
    const { resource, params } = Object.values(query)[0]
    return {
        resource,
        params: typeof params === 'function' ? params(variables) : params,
    }
}

const trackerResponse = (serverVersion, instances) => ({
    trackedEntities: {
        [serverVersion.minor === 40 ? 'instances' : 'trackedEntities']:
            instances,
    },
})

const load = ({
    config = {},
    serverVersion = v41,
    instances = [],
    settings = {},
} = {}) => {
    const engine = {
        query: jest
            .fn()
            .mockResolvedValue(trackerResponse(serverVersion, instances)),
    }
    const result = trackedEntityLoader({
        config: { ...baseConfig, ...config },
        engine,
        keyAnalysisDigitGroupSeparator: 'SPACE',
        serverVersion,
        ...settings,
    })
    return { engine, result }
}

describe('trackedEntityLoader tracker request', () => {
    it('requests a program with its filters on 2.41+', async () => {
        const { engine, result } = load({
            config: {
                program,
                programStatus: 'ACTIVE',
                followUp: true,
                periodType: 'program',
            },
        })
        await result

        expect(engine.query).toHaveBeenCalledTimes(1)
        expect(getRequest(engine)).toEqual({
            resource: 'tracker/trackedEntities',
            params: {
                fields: ['trackedEntity~rename(id)', 'geometry'],
                orgUnits: 'ou1,ou2',
                orgUnitMode: 'DESCENDANTS',
                program: 'program1',
                programStatus: 'ACTIVE',
                followUp: 'TRUE',
                enrollmentEnrolledAfter: '2024-01-01',
                enrollmentEnrolledBefore: '2024-12-31',
                paging: false,
            },
        })
    })

    it('sends the program status as enrollment status on 2.42+', async () => {
        const { engine, result } = load({
            serverVersion: v42,
            config: { program, programStatus: 'ACTIVE' },
        })
        await result

        const { params } = getRequest(engine)
        expect(params.enrollmentStatus).toBe('ACTIVE')
        expect(params.programStatus).toBeUndefined()
    })

    it('requests a program with its filters on 2.40', async () => {
        const { engine, result } = load({
            serverVersion: v40,
            config: {
                program,
                programStatus: 'ACTIVE',
                followUp: true,
                periodType: 'program',
            },
        })
        await result

        expect(getRequest(engine)).toEqual({
            resource: 'tracker/trackedEntities',
            params: {
                fields: ['trackedEntity~rename(id)', 'geometry'],
                orgUnit: 'ou1;ou2',
                ouMode: 'DESCENDANTS',
                program: 'program1',
                programStatus: 'ACTIVE',
                followUp: 'TRUE',
                enrollmentEnrolledAfter: '2024-01-01',
                enrollmentEnrolledBefore: '2024-12-31',
                skipPaging: true,
            },
        })
    })

    it.each([
        {
            version: '2.40',
            serverVersion: v40,
            followUp: false,
            expected: undefined,
        },
        {
            version: '2.40',
            serverVersion: v40,
            followUp: undefined,
            expected: undefined,
        },
        {
            version: '2.41',
            serverVersion: v41,
            followUp: false,
            expected: undefined,
        },
        {
            version: '2.41',
            serverVersion: v41,
            followUp: undefined,
            expected: undefined,
        },
        {
            version: '2.41',
            serverVersion: v41,
            followUp: true,
            expected: 'TRUE',
        },
    ])(
        'on $version sends followUp $followUp as $expected',
        async ({ serverVersion, followUp, expected }) => {
            const { engine, result } = load({
                serverVersion,
                config: { program, followUp },
            })
            await result

            expect(getRequest(engine).params.followUp).toBe(expected)
        }
    )

    it.each([
        { version: '2.40', serverVersion: v40 },
        { version: '2.41', serverVersion: v41 },
    ])(
        'on $version ignores the program filters without a program',
        async ({ serverVersion }) => {
            // Not possible from the app, only in a map created or edited elsewhere
            const { engine, result } = load({
                serverVersion,
                config: {
                    programStatus: 'ACTIVE',
                    followUp: true,
                    periodType: 'program',
                },
            })
            await result

            const { params } = getRequest(engine)
            expect(params).toMatchObject({
                trackedEntityType: 'teType1',
                updatedAfter: '2024-01-01',
                updatedBefore: '2024-12-31',
            })
            expect(params.program).toBeUndefined()
            expect(params.programStatus).toBeUndefined()
            expect(params.followUp).toBeUndefined()
            expect(params.enrollmentEnrolledAfter).toBeUndefined()
            expect(params.enrollmentEnrolledBefore).toBeUndefined()
        }
    )

    it('requests by last updated date for a program without the program period type', async () => {
        const { engine, result } = load({ config: { program } })
        await result

        expect(getRequest(engine).params).toMatchObject({
            program: 'program1',
            updatedAfter: '2024-01-01',
            updatedBefore: '2024-12-31',
        })
        expect(getRequest(engine).params.trackedEntityType).toBeUndefined()
    })

    it('sends no org unit mode when the layer has none', async () => {
        const { engine, result } = load({
            config: { organisationUnitSelectionMode: undefined },
        })
        await result

        expect(getRequest(engine).params.orgUnitMode).toBeUndefined()
    })
})

describe('trackedEntityLoader result', () => {
    it('keeps the instances with a supported geometry', async () => {
        const polygon = {
            id: 'te2',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 0],
                    ],
                ],
            },
        }
        const { result } = load({
            instances: [
                point('te1'),
                polygon,
                { id: 'te3' },
                {
                    id: 'te4',
                    geometry: { type: 'LineString', coordinates: [] },
                },
                { id: 'te5', geometry: { type: 'Point' } },
            ],
        })

        expect((await result).data).toEqual([
            {
                type: 'Feature',
                geometry: point('te1').geometry,
                properties: { id: 'te1' },
            },
            {
                type: 'Feature',
                geometry: polygon.geometry,
                properties: { id: 'te2' },
            },
        ])
    })

    it('reads the 2.40 response', async () => {
        const { result } = load({
            serverVersion: v40,
            instances: [point('te1')],
        })

        expect((await result).data).toHaveLength(1)
    })

    it('returns a loaded layer with its legend', async () => {
        const { result } = load({
            config: {
                program,
                programStatus: 'COMPLETED',
                eventPointColor: '#ff0000',
                eventPointRadius: 8,
                areaRadius: 500,
            },
            instances: [point('te1')],
        })

        expect(await result).toMatchObject({
            id: 'layer1',
            name: 'Malaria case',
            keyAnalysisDigitGroupSeparator: 'SPACE',
            isLoaded: true,
            isLoading: false,
            isExpanded: true,
            legend: {
                title: 'Malaria case',
                items: [
                    {
                        name: 'Person + 500 m buffer',
                        color: '#ff0000',
                        radius: 8,
                    },
                ],
                explanation: ['Program status: Completed'],
            },
        })
        expect((await result).alerts).toBeUndefined()
    })

    it('names the layer after the type without a program', async () => {
        const { result } = load({ instances: [point('te1')] })

        expect(await result).toMatchObject({
            name: 'Tracked entity',
            legend: { title: 'Tracked entity' },
        })
        expect((await result).legend.explanation).toBeUndefined()
    })

    // Not possible from the app, only in a map created or edited elsewhere
    it('shows an unknown program status as is', async () => {
        const { result } = load({
            config: { program, programStatus: 'UNKNOWN' },
            instances: [point('te1')],
        })

        expect((await result).legend.explanation).toEqual([
            'Program status: UNKNOWN',
        ])
    })

    it('warns when no tracked entity has a geometry', async () => {
        const { result } = load({ instances: [{ id: 'te1' }] })

        expect((await result).alerts).toEqual([
            { code: 'WARNING_NO_DATA', message: 'Person' },
        ])
        expect((await result).data).toEqual([])
    })

    it('finishes loading with an error when the request fails', async () => {
        const engine = { query: jest.fn().mockRejectedValue(new Error('Boom')) }

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            serverVersion: v41,
        })

        expect(result).toMatchObject({
            data: [],
            loadError: 'Boom',
            alerts: [{ code: 'ERROR_CRITICAL', message: 'Boom' }],
            isLoaded: true,
            isLoading: false,
        })
    })

    it('finishes loading with an error for a layer without dates', async () => {
        const { engine, result } = load({
            config: { startDate: undefined, endDate: undefined },
        })

        expect(await result).toMatchObject({
            data: [],
            alerts: [{ code: 'ERROR_CRITICAL' }],
            isLoaded: true,
        })
        expect((await result).loadError).toBeDefined()
        expect(engine.query).not.toHaveBeenCalled()
    })

    it('clears the alerts and error of a previous load', async () => {
        const { result } = load({
            config: {
                loadError: 'Boom',
                alerts: [{ code: 'ERROR_CRITICAL', message: 'Boom' }],
            },
            instances: [point('te1')],
        })

        expect((await result).loadError).toBeUndefined()
        expect((await result).alerts).toBeUndefined()
    })
})

describe('trackedEntityLoader relationships', () => {
    const constraint = {
        relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
        trackedEntityType: { id: 'teType1' },
        program: { id: 'program1' },
    }
    const relationshipType = {
        id: 'relType1',
        displayName: 'Contact',
        fromConstraint: constraint,
        toConstraint: constraint,
    }
    const relationship = {
        relationship: 'rel1',
        relationshipType: 'relType1',
        bidirectional: false,
        from: { trackedEntity: { trackedEntity: 'te1' } },
        to: { trackedEntity: { trackedEntity: 'te2' } },
    }
    const withRelationships = (instance) => ({
        ...instance,
        relationships: [relationship],
    })

    const loadWithRelationships = async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce(
                    trackerResponse(v41, [
                        withRelationships(point('te1')),
                        withRelationships(point('te2', [3, 4])),
                    ])
                )
                .mockResolvedValueOnce({ relationshipType })
                .mockResolvedValueOnce({
                    relatedEntityType: {
                        displayName: 'Contact person',
                        featureType: 'POINT',
                    },
                }),
        }
        const result = await trackedEntityLoader({
            config: {
                ...baseConfig,
                program,
                config: JSON.stringify({
                    relationships: { type: 'relType1', pointColor: '#00ff00' },
                }),
            },
            engine,
            serverVersion: v41,
        })
        return { engine, result }
    }

    it('requests the relationship type and the related type', async () => {
        const { engine } = await loadWithRelationships()

        expect(engine.query).toHaveBeenCalledTimes(3)
        expect(getRequest(engine, 1).resource).toBe('relationshipTypes')
        expect(engine.query.mock.calls[1][1]).toEqual({
            variables: { id: 'relType1' },
        })
        expect(getRequest(engine, 2)).toEqual({
            resource: 'trackedEntityTypes',
            params: { fields: 'displayName,featureType' },
        })
        expect(engine.query.mock.calls[2][1]).toEqual({
            variables: { id: 'teType1' },
        })
    })

    it('returns the relationships and the related instances', async () => {
        const { result } = await loadWithRelationships()

        expect(result.relationships).toEqual([
            expect.objectContaining({ id: 'rel1', bidirectional: false }),
        ])
        expect(result.data.map((f) => f.properties.id)).toEqual(['te1', 'te2'])
        expect(result.secondaryData.map((f) => f.properties.id)).toEqual([
            'te2',
        ])
    })

    it('adds the relationship to the legend', async () => {
        const { result } = await loadWithRelationships()

        expect(result.legend.items.slice(1)).toEqual([
            {
                type: 'LineString',
                name: 'Contact',
                color: '#0000BB',
                weight: 1,
            },
            {
                name: 'Contact person (related)',
                color: '#00ff00',
                radius: 3,
                weight: undefined,
            },
        ])
    })

    it.each([
        {
            version: '2.40',
            serverVersion: v40,
            root: 'instances',
            params: {
                orgUnit: 'ou1;ou2',
                ouMode: 'DESCENDANTS',
                skipPaging: true,
            },
        },
        {
            version: '2.41',
            serverVersion: v41,
            root: 'trackedEntities',
            params: {
                orgUnits: 'ou1,ou2',
                orgUnitMode: 'DESCENDANTS',
                paging: false,
            },
        },
    ])(
        'requests the related tracked entities with the layer org units on $version',
        async ({ serverVersion, root, params }) => {
            const engine = {
                query: jest
                    .fn()
                    .mockResolvedValueOnce(
                        trackerResponse(serverVersion, [
                            withRelationships(point('te1')),
                        ])
                    )
                    .mockResolvedValueOnce({
                        relationshipType: {
                            ...relationshipType,
                            toConstraint: {
                                ...constraint,
                                program: { id: 'program2' },
                            },
                        },
                    })
                    .mockResolvedValueOnce({
                        relatedEntityType: {
                            displayName: 'Contact person',
                            featureType: 'POINT',
                        },
                    })
                    .mockResolvedValueOnce({ tei: { [root]: [] } }),
            }

            await trackedEntityLoader({
                config: {
                    ...baseConfig,
                    program,
                    config: JSON.stringify({
                        relationships: { type: 'relType1' },
                    }),
                },
                engine,
                serverVersion,
            })

            expect(engine.query).toHaveBeenCalledTimes(4)
            expect(getRequest(engine, 3)).toEqual({
                resource: 'tracker/trackedEntities',
                params: {
                    fields: ['trackedEntity~rename(id)', 'geometry'],
                    program: 'program2',
                    ...params,
                },
            })
        }
    )

    it('shows the tracked entities for a relationship to events', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce(
                    trackerResponse(v41, [withRelationships(point('te1'))])
                )
                .mockResolvedValueOnce({
                    relationshipType: {
                        ...relationshipType,
                        toConstraint: {
                            relationshipEntity: 'PROGRAM_STAGE_INSTANCE',
                        },
                    },
                }),
        }

        const result = await trackedEntityLoader({
            config: {
                ...baseConfig,
                program,
                config: JSON.stringify({
                    relationships: { type: 'relType1' },
                }),
            },
            engine,
            serverVersion: v41,
        })

        // No request for the related type, and nothing to add to the legend
        expect(engine.query).toHaveBeenCalledTimes(2)
        expect(result.data.map((f) => f.properties.id)).toEqual(['te1'])
        expect(result.relationships).toEqual([])
        expect(result.secondaryData).toEqual([])
        expect(result.legend.items).toHaveLength(1)
    })

    it('requests the relationships of each tracked entity', async () => {
        const { engine } = await loadWithRelationships()

        expect(getRequest(engine).params.fields).toEqual([
            'trackedEntity~rename(id)',
            'geometry',
            'relationships',
        ])
    })

    it('shows the tracked entities with a warning when a relationship request fails', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce(
                    trackerResponse(v41, [withRelationships(point('te1'))])
                )
                .mockRejectedValueOnce(new Error('Not found')),
        }

        const result = await trackedEntityLoader({
            config: {
                ...baseConfig,
                program,
                config: JSON.stringify({
                    relationships: { type: 'relType1' },
                }),
            },
            engine,
            serverVersion: v41,
        })

        expect(result.data.map((f) => f.properties.id)).toEqual(['te1'])
        expect(result.alerts).toEqual([
            {
                warning: true,
                code: 'CUSTOM_ALERT',
                message: 'Malaria case: Relationships could not be loaded',
            },
        ])
        expect(result.loadError).toBeUndefined()
        expect(result.relationships).toBeUndefined()
        expect(result.secondaryData).toBeUndefined()
        expect(result.legend.items).toHaveLength(1)
    })
})

describe('trackedEntityLoader tracker limit', () => {
    const truncated = {
        warning: true,
        code: 'CUSTOM_ALERT',
        message: 'Malaria case: Displaying first 2 tracked entities',
    }

    it.each([
        {
            version: '2.40',
            serverVersion: v40,
            settings: { KeyTrackedEntityInstanceMaxLimit: 2 },
        },
        {
            version: '2.41',
            serverVersion: v41,
            settings: { KeyTrackedEntityMaxLimit: 2 },
        },
    ])(
        'warns on $version when the limit is reached',
        async ({ serverVersion, settings }) => {
            const { result } = load({
                serverVersion,
                settings,
                config: { program },
                // Rows without geometry count too
                instances: [point('te1'), { id: 'te2' }],
            })

            expect((await result).alerts).toEqual([truncated])
        }
    )

    it('does not warn below the limit', async () => {
        const { result } = load({
            settings: { KeyTrackedEntityMaxLimit: 3 },
            config: { program },
            instances: [point('te1'), point('te2', [3, 4])],
        })

        expect((await result).alerts).toBeUndefined()
    })

    // 2.40 only knows KeyTrackedEntityInstanceMaxLimit
    it('ignores the 2.41+ limit setting on 2.40', async () => {
        const { result } = load({
            serverVersion: v40,
            settings: { KeyTrackedEntityMaxLimit: 1 },
            config: { program },
            instances: [point('te1'), point('te2', [3, 4])],
        })

        expect((await result).alerts).toBeUndefined()
    })

    it('formats the limit with the digit group separator', async () => {
        const instances = Array.from({ length: 1000 }, (_, i) =>
            point(`te${i}`)
        )
        const { result } = load({
            settings: { KeyTrackedEntityMaxLimit: 1000 },
            config: { program },
            instances,
        })

        expect((await result).alerts[0].message).toBe(
            'Malaria case: Displaying first 1 000 tracked entities'
        )
    })
})
