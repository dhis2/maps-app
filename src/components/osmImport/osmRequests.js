import { OSM_METADATA } from './osmMetadata.js'

export const fetchOsmPrograms = (engine, codes) =>
    engine
        .query({
            programs: {
                resource: 'programs',
                params: {
                    filter: `code:in:[${codes.join(',')}]`,
                    fields: 'id,code',
                    paging: false,
                },
            },
        })
        .then(({ programs }) => programs.programs)

export const createOsmMetadata = (engine) =>
    engine.mutate({
        resource: 'metadata',
        type: 'create',
        params: { importStrategy: 'CREATE_AND_UPDATE' },
        data: OSM_METADATA,
    })

export const fetchOrgUnitGeometry = (engine, id) =>
    engine
        .query({
            orgUnit: {
                resource: 'organisationUnits',
                id,
                params: { fields: 'id,displayName~rename(name),geometry' },
            },
        })
        .then(({ orgUnit }) => orgUnit)

// Events can only be saved for org units assigned to the program
export const assignOrgUnitToProgram = async (engine, programId, orgUnitId) => {
    const { programs } = await engine.query({
        programs: {
            resource: 'programs',
            params: {
                filter: [
                    `id:eq:${programId}`,
                    `organisationUnits.id:eq:${orgUnitId}`,
                ],
                fields: 'id',
            },
        },
    })

    if (programs.programs.length) {
        return
    }

    return engine.mutate({
        resource: 'programs',
        id: programId,
        type: 'json-patch',
        data: [
            {
                op: 'add',
                path: '/organisationUnits/-',
                value: { id: orgUnitId },
            },
        ],
    })
}

// orgUnitMode: SELECTED to match an import, DESCENDANTS to show on map
export const fetchOsmEvents = (
    engine,
    { programId, orgUnitId, orgUnitMode = 'SELECTED' }
) =>
    engine
        .query({
            events: {
                resource: 'tracker/events',
                params: {
                    program: programId,
                    orgUnit: orgUnitId,
                    orgUnitMode,
                    paging: false,
                    fields: 'event,geometry,dataValues[dataElement,value]',
                },
            },
        })
        .then(({ events }) => events.events)

export const importOsmEvents = (engine, events) =>
    engine.mutate({
        resource: 'tracker',
        type: 'create',
        params: { importStrategy: 'CREATE_AND_UPDATE', async: false },
        data: { events },
    })
