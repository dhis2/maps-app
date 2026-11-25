// Metadata created by the "Set up OSM import" step, one program per category.
// Fixed UIDs so the setup can be re-run (CREATE_AND_UPDATE) without creating
// duplicates.

export const OSM_DATA_ELEMENTS = {
    id: 'oWgIYNW9GU6',
    name: 'RgnK9txgC0U',
    version: 'ucokv1Fn3TG',
    lastEdited: 'rwmgYEytije',
    facilityType: 'TPUva1kYIJR',
    roadClass: 'FrmWJrbEcsh',
    roadSurface: 'flxbmc63pAL',
    lineGeometry: 'cJtDjvBDH6B',
    editedBy: 'WFoIlGaMQWL',
    locallyEdited: 'pgCy3scMDrF',
    featureKey: 's2V8Ga0uq5e',
    length: 'ooMnpnNQr9H',
    tag: 'kyeAS228jn2',
    subcategory: 'f3nRYm5DNOi',
    type: 'Ln8TzcI61ff',
}

// By category id. Health facilities and roads came first, with their own
// type data element.
export const OSM_PROGRAMS = {
    health_facilities: {
        code: 'OSM_HEALTH_FACILITIES',
        name: 'OSM health facilities',
        id: 'duL5mvaOFgU',
        programStage: 'UlT7Oirp3G8',
    },
    education: {
        code: 'OSM_EDUCATION',
        name: 'OSM education',
        id: 'LH0UH324fE0',
        programStage: 'VAwaJKMqdou',
    },
    water_sanitation: {
        code: 'OSM_WATER_SANITATION',
        name: 'OSM water and sanitation',
        id: 'EwqvVhdzSYn',
        programStage: 'rWde6lLtCyN',
    },
    humanitarian: {
        code: 'OSM_HUMANITARIAN',
        name: 'OSM humanitarian',
        id: 'QfxcYZesMDX',
        programStage: 'pLa9FNTMjHJ',
    },
    public_services: {
        code: 'OSM_PUBLIC_SERVICES',
        name: 'OSM public services',
        id: 'KWDmE5fzihp',
        programStage: 'oIJHYEHWC0y',
    },
    cemeteries: {
        code: 'OSM_CEMETERIES',
        name: 'OSM cemeteries',
        id: 'wbfZgGdf9XZ',
        programStage: 'sIGQrdliQOP',
    },
    settlements: {
        code: 'OSM_SETTLEMENTS',
        name: 'OSM settlements',
        id: 'ig5fOJ1IzoO',
        programStage: 'up1BEZQZ3xL',
    },
    transport_hubs: {
        code: 'OSM_TRANSPORT_HUBS',
        name: 'OSM transport hubs',
        id: 'bYC0xQJ27AL',
        programStage: 'O0ZLGDYF9bV',
    },
    roads: {
        code: 'OSM_ROADS',
        name: 'OSM roads',
        id: 'jigpifhOfkx',
        programStage: 'I1vkRkNDkx8',
    },
    waterways: {
        code: 'OSM_WATERWAYS',
        name: 'OSM waterways',
        id: 'bIetKPxwym3',
        programStage: 'l7t8LppKy7Z',
    },
}

const dataElement = ([
    id,
    code,
    name,
    valueType = 'TEXT',
    aggregationType = 'NONE',
]) => ({
    id,
    code,
    name,
    shortName: name,
    valueType,
    domainType: 'TRACKER',
    aggregationType,
    sharing: { public: 'rw------' },
})

const DE = OSM_DATA_ELEMENTS

// Shared by all programs, created with any category
const DATA_ELEMENTS = [
    dataElement([DE.id, 'OSM_ID', 'OSM id']),
    dataElement([DE.name, 'OSM_NAME', 'OSM name']),
    dataElement([DE.version, 'OSM_VERSION', 'OSM version', 'INTEGER']),
    dataElement([DE.lastEdited, 'OSM_LAST_EDITED', 'OSM last edited']),
    dataElement([DE.editedBy, 'OSM_EDITED_BY', 'OSM edited by']),
    dataElement([
        DE.locallyEdited,
        'OSM_LOCALLY_EDITED',
        'OSM locally edited',
        'TRUE_ONLY',
    ]),
    // OSM id, or local/<uid> for hand-added features, shared by the pieces
    // of a road split per org unit
    dataElement([DE.featureKey, 'OSM_FEATURE_KEY', 'OSM feature key']),
    // key=value, e.g. amenity=school
    dataElement([DE.tag, 'OSM_TAG', 'OSM tag']),
    dataElement([DE.subcategory, 'OSM_SUBCATEGORY', 'OSM subcategory']),
    dataElement([DE.type, 'OSM_TYPE', 'OSM type']),
    dataElement([DE.facilityType, 'OSM_FACILITY_TYPE', 'OSM facility type']),
    dataElement([DE.roadClass, 'OSM_ROAD_CLASS', 'OSM road class']),
    dataElement([DE.roadSurface, 'OSM_ROAD_SURFACE', 'OSM road surface']),
    dataElement([
        DE.length,
        'OSM_LENGTH',
        'OSM length (m)',
        'INTEGER_ZERO_OR_POSITIVE',
        'SUM',
    ]),
    dataElement([
        DE.lineGeometry,
        'OSM_LINE_GEOMETRY',
        'OSM line geometry',
        'LONG_TEXT',
    ]),
]

// The data elements of a category's program stage
export const getStageDataElements = (category) => [
    DE.id,
    DE.name,
    category.typeDataElement,
    DE.tag,
    DE.subcategory,
    DE.version,
    DE.lastEdited,
    DE.editedBy,
    DE.locallyEdited,
    DE.featureKey,
    ...(category.surfaceOptions ? [DE.roadSurface] : []),
    ...(category.geometry === 'line' ? [DE.length, DE.lineGeometry] : []),
]

// Metadata for one category: the shared data elements, its program and stage
export const getOsmMetadata = (category) => {
    const { id, code, name, programStage } = category.program
    const sharing = { public: 'rwrw----' }

    return {
        dataElements: DATA_ELEMENTS,
        programs: [
            {
                id,
                code,
                name,
                shortName: name,
                programType: 'WITHOUT_REGISTRATION',
                featureType: 'POINT',
                programStages: [{ id: programStage }],
                sharing,
            },
        ],
        programStages: [
            {
                id: programStage,
                name,
                program: { id },
                featureType: 'POINT',
                programStageDataElements: getStageDataElements(category).map(
                    (dataElementId) => ({ dataElement: { id: dataElementId } })
                ),
                sharing,
            },
        ],
    }
}
