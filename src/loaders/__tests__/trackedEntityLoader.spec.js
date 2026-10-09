import { Analytics } from '@dhis2/analytics'
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

// Tracker analytics without a table for the type (E7144): the loader uses the
// tracker API, which these tests check
const noAnalytics = () => {
    const request = {
        withTrackedEntityType: () => request,
        addOrgUnitDimension: () => request,
        withOuMode: () => request,
        withParameters: () => request,
        withPageSize: () => request,
    }
    return {
        request: function () {
            return request
        },
        trackedEntities: {
            getQuery: jest
                .fn()
                .mockRejectedValue({ details: { errorCode: 'E7144' } }),
        },
    }
}

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
        analyticsEngine: noAnalytics(),
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

    it.each([
        {
            version: '2.40',
            serverVersion: v40,
            param: 'ouMode',
            mode: 'SELECTED',
        },
        {
            version: '2.41',
            serverVersion: v41,
            param: 'orgUnitMode',
            mode: 'DESCENDANTS',
        },
    ])(
        'on $version defaults the org unit mode to $mode',
        async ({ serverVersion, param, mode }) => {
            const { engine, result } = load({
                serverVersion,
                config: { organisationUnitSelectionMode: undefined },
            })
            await result

            expect(getRequest(engine).params[param]).toBe(mode)
        }
    )

    it.each([
        {
            version: '2.40',
            serverVersion: v40,
            param: 'ouMode',
            mode: 'CHILDREN',
        },
        {
            version: '2.41',
            serverVersion: v41,
            param: 'orgUnitMode',
            mode: 'SELECTED',
        },
    ])(
        'on $version keeps the org unit mode of the layer',
        async ({ serverVersion, param, mode }) => {
            const { engine, result } = load({
                serverVersion,
                config: { organisationUnitSelectionMode: mode },
            })
            await result

            expect(getRequest(engine).params[param]).toBe(mode)
        }
    )
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
            analyticsEngine: noAnalytics(),
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
            analyticsEngine: noAnalytics(),
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
                analyticsEngine: noAnalytics(),
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

    it('requests the related tracked entities with the default org unit mode', async () => {
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
                .mockResolvedValueOnce({ tei: { trackedEntities: [] } }),
        }

        await trackedEntityLoader({
            config: {
                ...baseConfig,
                organisationUnitSelectionMode: undefined,
                program,
                config: JSON.stringify({ relationships: { type: 'relType1' } }),
            },
            engine,
            analyticsEngine: noAnalytics(),
            serverVersion: v41,
        })

        expect(getRequest(engine, 0).params.orgUnitMode).toBe('DESCENDANTS')
        expect(getRequest(engine, 3).params.orgUnitMode).toBe('DESCENDANTS')
    })

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
            analyticsEngine: noAnalytics(),
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
            analyticsEngine: noAnalytics(),
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

    it('warns when the related tracked entities reach the limit', async () => {
        const constraint = (program) => ({
            relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
            trackedEntityType: { id: 'teType1' },
            program: { id: program },
        })
        const relationship = {
            relationship: 'rel1',
            relationshipType: 'relType1',
            from: { trackedEntity: { trackedEntity: 'te1' } },
            to: { trackedEntity: { trackedEntity: 'te2' } },
        }
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce(
                    trackerResponse(v41, [
                        { ...point('te1'), relationships: [relationship] },
                    ])
                )
                .mockResolvedValueOnce({
                    relationshipType: {
                        id: 'relType1',
                        displayName: 'Contact',
                        fromConstraint: constraint('program1'),
                        toConstraint: constraint('program2'),
                    },
                })
                .mockResolvedValueOnce({
                    relatedEntityType: {
                        displayName: 'Contact person',
                        featureType: 'POINT',
                    },
                })
                .mockResolvedValueOnce({
                    tei: {
                        trackedEntities: [
                            point('te2', [3, 4]),
                            point('te3', [5, 6]),
                        ],
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
            KeyTrackedEntityMaxLimit: 2,
        })

        expect(result.alerts).toEqual([
            {
                warning: true,
                code: 'CUSTOM_ALERT',
                message:
                    'Malaria case: Displaying first 2 related tracked entities',
            },
        ])
    })
})

describe('trackedEntityLoader tracker analytics', () => {
    const v42 = { major: 2, minor: 42, patch: 0 }

    const analyticsResponse = (
        rows,
        total = rows.length,
        idColumn = 'trackedentity'
    ) => ({
        data: {
            headers: [{ name: idColumn }, { name: 'geometry' }],
            rows,
            metaData: { pager: { page: 1, total } },
        },
    })

    const isAnalyticsCall = ([query]) => 'data' in query

    // getAnalytics keeps the first engine it gets, so the tests share one
    const engine = { query: jest.fn() }
    const analyticsEngine = Analytics.getAnalytics(engine)

    const loadWithAnalytics = async ({
        config = {},
        serverVersion = v42,
        analytics = () => Promise.resolve(analyticsResponse([])),
    } = {}) => {
        engine.query.mockReset()
        engine.query.mockImplementation((query) =>
            'data' in query
                ? analytics()
                : Promise.resolve(
                      trackerResponse(serverVersion, [point('te9')])
                  )
        )
        const result = await trackedEntityLoader({
            config: { ...baseConfig, ...config },
            engine,
            analyticsEngine,
            keyAnalysisDigitGroupSeparator: 'SPACE',
            serverVersion,
        })
        const calls = engine.query.mock.calls
        return {
            result,
            analyticsCalls: calls.filter(isAnalyticsCall),
            trackerCalls: calls.filter((call) => !isAnalyticsCall(call)),
        }
    }

    it('loads the tracked entities from analytics on 2.41+', async () => {
        const { result, trackerCalls } = await loadWithAnalytics({
            analytics: () =>
                Promise.resolve(
                    analyticsResponse([
                        ['te1', 'POINT(1 2)'],
                        ['te2', 'SRID=4326;POLYGON((0 0,1 0,1 1,0 0))'],
                        ['te3', ''],
                        ['te4', 'LINESTRING(0 0,1 1)'],
                    ])
                ),
        })

        expect(trackerCalls).toHaveLength(0)
        expect(result.data).toEqual([
            {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [1, 2] },
                properties: { id: 'te1' },
            },
            {
                type: 'Feature',
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
                properties: { id: 'te2' },
            },
        ])
    })

    it('requests the id and geometry of the tracked entities', async () => {
        const { analyticsCalls } = await loadWithAnalytics()
        const { variables } = analyticsCalls[0][1]

        expect(variables).toMatchObject({
            path: 'trackedEntities/query',
            trackedEntityType: 'teType1',
            dimensions: ['ou:ou1;ou2'],
        })
        // Not in the path: trackedEntities/query/{program} is invalid
        expect(variables.program).toBeUndefined()
        expect(variables.parameters).toEqual({
            headers: 'trackedentity,geometry',
            geometryOnly: true,
            ouMode: 'DESCENDANTS',
            lastUpdated: '2024-01-01_2024-12-31',
            pageSize: 50000,
            totalPages: true,
        })
    })

    it('names the id column trackedentityinstanceuid on 2.41', async () => {
        const { result, analyticsCalls } = await loadWithAnalytics({
            serverVersion: v41,
            analytics: () =>
                Promise.resolve(
                    analyticsResponse(
                        [['te1', 'POINT(1 2)']],
                        1,
                        'trackedentityinstanceuid'
                    )
                ),
        })

        expect(analyticsCalls[0][1].variables.parameters.headers).toBe(
            'trackedentityinstanceuid,geometry'
        )
        expect(result.data[0].properties.id).toBe('te1')
    })

    it('qualifies the program filters with the program', async () => {
        const { analyticsCalls } = await loadWithAnalytics({
            config: {
                program,
                programStatus: 'ACTIVE',
                periodType: 'program',
            },
        })

        expect(analyticsCalls[0][1].variables.parameters).toMatchObject({
            program: 'program1',
            enrollmentStatus: 'program1.ACTIVE',
            enrollmentDate: 'program1.2024-01-01_2024-12-31',
        })
        expect(
            analyticsCalls[0][1].variables.parameters.lastUpdated
        ).toBeUndefined()
    })

    // Not possible from the app, only in a map created or edited elsewhere
    it('ignores the program filters without a program', async () => {
        const { analyticsCalls } = await loadWithAnalytics({
            config: { programStatus: 'ACTIVE', periodType: 'program' },
        })
        const { parameters } = analyticsCalls[0][1].variables

        expect(parameters.enrollmentStatus).toBeUndefined()
        expect(parameters.enrollmentDate).toBeUndefined()
        expect(parameters.lastUpdated).toBe('2024-01-01_2024-12-31')
    })

    it('uses all levels below when the layer has no org unit mode', async () => {
        const { analyticsCalls } = await loadWithAnalytics({
            config: { organisationUnitSelectionMode: undefined },
        })

        expect(analyticsCalls[0][1].variables.parameters.ouMode).toBe(
            'DESCENDANTS'
        )
    })

    it.each([
        { name: 'on 2.40', serverVersion: v40, config: {} },
        {
            name: 'with follow-up',
            serverVersion: v42,
            config: { program, followUp: true },
        },
        {
            name: 'for relationships',
            serverVersion: v42,
            config: {
                program,
                config: JSON.stringify({ relationships: { type: 'relType1' } }),
            },
        },
    ])(
        'loads from the tracker API $name',
        async ({ serverVersion, config }) => {
            const { result, analyticsCalls } = await loadWithAnalytics({
                serverVersion,
                config,
            })

            expect(analyticsCalls).toHaveLength(0)
            expect(result.data.map((f) => f.properties.id)).toEqual(['te9'])
        }
    )

    it.each([['E7144'], ['E7217']])(
        'falls back to the tracker API on %s',
        async (errorCode) => {
            const { result, trackerCalls } = await loadWithAnalytics({
                analytics: () => Promise.reject({ details: { errorCode } }),
            })

            expect(trackerCalls).toHaveLength(1)
            expect(result.data.map((f) => f.properties.id)).toEqual(['te9'])
            expect(result.loadError).toBeUndefined()
        }
    )

    it('shows other analytics errors', async () => {
        const { result, trackerCalls } = await loadWithAnalytics({
            analytics: () =>
                Promise.reject({
                    message: 'Program is specified but does not exist',
                    details: { errorCode: 'E7129' },
                }),
        })

        expect(trackerCalls).toHaveLength(0)
        expect(result.loadError).toBe('Program is specified but does not exist')
    })

    it('warns with the number of rows and the total when there are more', async () => {
        const { result } = await loadWithAnalytics({
            config: { program },
            // The server can return fewer rows than the page size
            analytics: () =>
                Promise.resolve(
                    analyticsResponse(
                        [
                            ['te1', 'POINT(1 2)'],
                            ['te2', 'POINT(3 4)'],
                        ],
                        250000
                    )
                ),
        })

        expect(result.alerts).toEqual([
            {
                warning: true,
                code: 'CUSTOM_ALERT',
                message:
                    'Malaria case: Displaying first 2 tracked entities out of 250 000',
            },
        ])
    })

    it('does not warn for an empty result', async () => {
        const { result } = await loadWithAnalytics({
            analytics: () => Promise.resolve(analyticsResponse([], 0)),
        })

        expect(result.alerts).toEqual([
            { code: 'WARNING_NO_DATA', message: 'Person' },
        ])
    })
})
