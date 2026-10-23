// Metadata created by the "Set up OSM import" step. Fixed UIDs so the
// setup can be re-run (CREATE_AND_UPDATE) without creating duplicates.

export const OSM_DATA_ELEMENTS = {
    id: 'oWgIYNW9GU6',
    name: 'RgnK9txgC0U',
    version: 'ucokv1Fn3TG',
    lastEdited: 'rwmgYEytije',
    facilityType: 'TPUva1kYIJR',
    roadClass: 'FrmWJrbEcsh',
    roadSurface: 'flxbmc63pAL',
    lineGeometry: 'cJtDjvBDH6B',
}

export const OSM_HEALTH_FACILITIES_PROGRAM = {
    code: 'OSM_HEALTH_FACILITIES',
    id: 'duL5mvaOFgU',
    programStage: 'UlT7Oirp3G8',
}

export const OSM_ROADS_PROGRAM = {
    code: 'OSM_ROADS',
    id: 'jigpifhOfkx',
    programStage: 'I1vkRkNDkx8',
}

const dataElement = ([id, code, name, valueType = 'TEXT']) => ({
    id,
    code,
    name,
    shortName: name,
    valueType,
    domainType: 'TRACKER',
    aggregationType: 'NONE',
    sharing: { public: 'rw------' },
})

const program = ({ id, code, programStage }, name) => ({
    id,
    code,
    name,
    shortName: name,
    programType: 'WITHOUT_REGISTRATION',
    featureType: 'POINT',
    programStages: [{ id: programStage }],
    sharing: { public: 'rwrw----' },
})

const programStage = ({ id, programStage }, name, dataElements) => ({
    id: programStage,
    name,
    program: { id },
    featureType: 'POINT',
    programStageDataElements: dataElements.map((id) => ({
        dataElement: { id },
    })),
    sharing: { public: 'rwrw----' },
})

const DE = OSM_DATA_ELEMENTS

const facilityDataElements = [
    DE.id,
    DE.name,
    DE.facilityType,
    DE.version,
    DE.lastEdited,
]

const roadDataElements = [
    DE.id,
    DE.name,
    DE.roadClass,
    DE.roadSurface,
    DE.version,
    DE.lastEdited,
    DE.lineGeometry,
]

export const OSM_METADATA = {
    dataElements: [
        dataElement([DE.id, 'OSM_ID', 'OSM id']),
        dataElement([DE.name, 'OSM_NAME', 'OSM name']),
        dataElement([DE.version, 'OSM_VERSION', 'OSM version', 'INTEGER']),
        dataElement([DE.lastEdited, 'OSM_LAST_EDITED', 'OSM last edited']),
        dataElement([
            DE.facilityType,
            'OSM_FACILITY_TYPE',
            'OSM facility type',
        ]),
        dataElement([DE.roadClass, 'OSM_ROAD_CLASS', 'OSM road class']),
        dataElement([DE.roadSurface, 'OSM_ROAD_SURFACE', 'OSM road surface']),
        dataElement([
            DE.lineGeometry,
            'OSM_LINE_GEOMETRY',
            'OSM line geometry',
            'LONG_TEXT',
        ]),
    ],
    programs: [
        program(OSM_HEALTH_FACILITIES_PROGRAM, 'OSM health facilities'),
        program(OSM_ROADS_PROGRAM, 'OSM roads'),
    ],
    programStages: [
        programStage(
            OSM_HEALTH_FACILITIES_PROGRAM,
            'OSM health facility',
            facilityDataElements
        ),
        programStage(OSM_ROADS_PROGRAM, 'OSM road', roadDataElements),
    ],
}
