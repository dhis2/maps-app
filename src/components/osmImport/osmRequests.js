import {
    getOsmMetadata,
    getStageDataElements,
    OSM_DATA_ELEMENTS,
} from './osmMetadata.js'

/**
 * Whether the category needs the setup: its program is missing, or its
 * stage misses data elements added since.
 */
export const isOsmSetupMissing = async (engine, category) => {
    const { stages } = await engine.query({
        stages: {
            resource: 'programStages',
            params: {
                filter: `id:eq:${category.program.programStage}`,
                fields: 'programStageDataElements[dataElement[id]]',
                paging: false,
            },
        },
    })
    const [stage] = stages.programStages
    if (!stage) {
        return true
    }
    const ids = stage.programStageDataElements.map(
        ({ dataElement }) => dataElement.id
    )
    return getStageDataElements(category).some((id) => !ids.includes(id))
}

// A metadata update replaces the whole program, so the org units assigned
// during imports are sent back with it
export const createOsmMetadata = async (engine, category) => {
    const metadata = getOsmMetadata(category)
    const { programs } = await engine.query({
        programs: {
            resource: 'programs',
            params: {
                filter: `id:eq:${category.program.id}`,
                fields: 'id,organisationUnits[id]',
                paging: false,
            },
        },
    })
    const organisationUnits = programs.programs[0]?.organisationUnits ?? []

    return engine.mutate({
        resource: 'metadata',
        type: 'create',
        params: { importStrategy: 'CREATE_AND_UPDATE' },
        data: {
            ...metadata,
            programs: metadata.programs.map((program) => ({
                ...program,
                organisationUnits,
            })),
        },
    })
}

const CHUNK_SIZE = 100
const PARALLEL_REQUESTS = 4
const PAGE_SIZE = 1000
const WRITE_CHUNK_SIZE = 500

const EVENT_FIELDS =
    'event,orgUnit,updatedAt,geometry,dataValues[dataElement,value]'

const chunk = (list, size) =>
    Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
        list.slice(i * size, (i + 1) * size)
    )

// Runs the requests a few at a time
const runLimited = async (tasks, limit = PARALLEL_REQUESTS) => {
    const results = []
    for (const batch of chunk(tasks, limit)) {
        results.push(...(await Promise.all(batch.map((task) => task()))))
    }
    return results
}

/**
 * Makes sure the org units are assigned to the program, as tracker only
 * accepts events there. Writes only when some are missing, so users without
 * write access to the program can import into assigned org units.
 */
export const ensureProgramOrgUnits = async (engine, programId, orgUnitIds) => {
    const ids = [...new Set(orgUnitIds)]
    if (!ids.length) {
        return
    }

    let assigned
    try {
        const results = await runLimited(
            chunk(ids, CHUNK_SIZE).map(
                (chunkIds) => () =>
                    engine.query({
                        orgUnits: {
                            resource: 'organisationUnits',
                            params: {
                                filter: [
                                    `id:in:[${chunkIds.join(',')}]`,
                                    `programs.id:eq:${programId}`,
                                ],
                                fields: 'id',
                                paging: false,
                            },
                        },
                    })
            )
        )
        assigned = results.flatMap(({ orgUnits }) => orgUnits.organisationUnits)
    } catch {
        // Fallback if the programs filter isn't supported
        const { program } = await engine.query({
            program: {
                resource: 'programs',
                id: programId,
                params: { fields: 'organisationUnits[id]' },
            },
        })
        assigned = program.organisationUnits
    }

    const assignedIds = new Set(assigned.map(({ id }) => id))
    const missing = ids.filter((id) => !assignedIds.has(id))

    if (missing.length) {
        await engine.mutate({
            resource: `programs/${programId}/organisationUnits`,
            type: 'create',
            data: { additions: missing.map((id) => ({ id })) },
        })
    }
}

// Events of the org unit and its descendants (or another orgUnitMode), all pages
export const fetchOsmEvents = async (
    engine,
    { programId, orgUnitId, orgUnitMode = 'DESCENDANTS' }
) => {
    const events = []
    for (let page = 1; ; page++) {
        const { result } = await engine.query({
            result: {
                resource: 'tracker/events',
                params: {
                    program: programId,
                    orgUnit: orgUnitId,
                    orgUnitMode,
                    page,
                    pageSize: PAGE_SIZE,
                    fields: EVENT_FIELDS,
                },
            },
        })
        events.push(...result.events)
        if (result.events.length < PAGE_SIZE) {
            return events
        }
    }
}

/**
 * Events anywhere the user can see, with a data element value in the list.
 * Values are not escaped: 2.41 reads node/1 correctly, but not node//1.
 */
export const fetchOsmEventsByValue = async (
    engine,
    { programId, dataElement, values }
) => {
    const results = await runLimited(
        chunk([...new Set(values)], CHUNK_SIZE).map(
            (chunkValues) => () =>
                engine.query({
                    result: {
                        resource: 'tracker/events',
                        params: {
                            program: programId,
                            orgUnitMode: 'ACCESSIBLE',
                            filter: `${dataElement}:in:${chunkValues.join(
                                ';'
                            )}`,
                            paging: false,
                            fields: EVENT_FIELDS,
                        },
                    },
                })
        )
    )
    return results.flatMap(({ result }) => result.events)
}

const importChunk = (engine, events, importStrategy) =>
    engine.mutate({
        resource: 'tracker',
        type: 'create',
        params: { importStrategy, async: false },
        data: { events },
    })

const sumStats = (responses) =>
    responses.reduce(
        (total, { stats = {} }) => ({
            created: total.created + (stats.created ?? 0),
            updated: total.updated + (stats.updated ?? 0),
            deleted: total.deleted + (stats.deleted ?? 0),
            ignored: total.ignored + (stats.ignored ?? 0),
        }),
        { created: 0, updated: 0, deleted: 0, ignored: 0 }
    )

// Creates and updates in chunks, returns summed stats
export const importOsmEvents = async (engine, events) => {
    const responses = []
    for (const eventsChunk of chunk(events, WRITE_CHUNK_SIZE)) {
        responses.push(
            await importChunk(engine, eventsChunk, 'CREATE_AND_UPDATE')
        )
    }
    return sumStats(responses)
}

export const deleteOsmEvents = async (engine, eventIds) => {
    const responses = []
    for (const idsChunk of chunk([...new Set(eventIds)], WRITE_CHUNK_SIZE)) {
        responses.push(
            await importChunk(
                engine,
                idsChunk.map((event) => ({ event })),
                'DELETE'
            )
        )
    }
    return sumStats(responses)
}

// Names only, for the feature profile
export const fetchOrgUnitNames = async (engine, ids) => {
    const results = await runLimited(
        chunk([...new Set(ids)], CHUNK_SIZE).map(
            (chunkIds) => () =>
                engine.query({
                    result: {
                        resource: 'organisationUnits',
                        params: {
                            filter: `id:in:[${chunkIds.join(',')}]`,
                            fields: 'id,displayName~rename(name)',
                            paging: false,
                        },
                    },
                })
        )
    )
    return new Map(
        results
            .flatMap(({ result }) => result.organisationUnits)
            .map(({ id, name }) => [id, name])
    )
}

export const fetchOsmEvent = (engine, id) =>
    engine
        .query({
            event: {
                resource: 'tracker/events',
                id,
                params: { fields: EVENT_FIELDS },
            },
        })
        .then(({ event }) => event)

// All pieces of a feature (a road is split per org unit), by feature key,
// and by OSM id for events from before the feature key
export const fetchFeaturePieces = async (engine, programId, feature) => {
    const lookups = [
        feature.featureKey && {
            dataElement: OSM_DATA_ELEMENTS.featureKey,
            values: [feature.featureKey],
        },
        feature.osmId && {
            dataElement: OSM_DATA_ELEMENTS.id,
            values: [feature.osmId],
        },
    ].filter(Boolean)

    const events = (
        await Promise.all(
            lookups.map((lookup) =>
                fetchOsmEventsByValue(engine, { programId, ...lookup })
            )
        )
    ).flat()
    const pieces = [
        ...new Map(events.map((event) => [event.event, event])).values(),
    ]
    return pieces.length
        ? pieces
        : [await fetchOsmEvent(engine, feature.eventId)]
}

// Tracker import errors carry the reason in the validation report
export const getOsmErrorMessage = (error) =>
    error.details?.validationReport?.errorReports?.[0]?.message ?? error.message
