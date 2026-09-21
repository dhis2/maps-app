import { qualitativeColors } from '../constants/colors.js'
import {
    COORDINATE_FIELD_NAMES,
    GEOMETRY_SOURCE_COLORS,
    EVENT_COORDINATE_CASCADING,
    EVENT_COORDINATE_DEFAULT,
    EVENT_COORDINATE_ENROLLMENT,
    EVENT_COORDINATE_ORG_UNIT,
    EVENT_COORDINATE_TRACKED_ENTITY,
    NONE,
} from '../constants/layers.js'
import {
    EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
    EVENT_PROGRAM_ATTRIBUTES_QUERY,
    EVENT_PROGRAM_TRACKED_ENTITY_TYPE_QUERY,
} from '../util/event.js'

// Resolves a coordinate field id to its name/valueType - only custom DE/TEA
// fields need the query, built-in fields (psigeometry etc.) are static.
export const loadEventCoordinateField = async ({
    program,
    programStage,
    fieldId,
    engine,
    displayNameProp,
}) => {
    if (!fieldId) {
        return undefined
    }

    if (COORDINATE_FIELD_NAMES[fieldId]) {
        return { name: COORDINATE_FIELD_NAMES[fieldId] }
    }

    const { programStage: programStageData } = await engine.query(
        EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
        {
            variables: { id: programStage.id, nameProperty: displayNameProp },
        }
    )
    const { programStageDataElements } = programStageData
    if (Array.isArray(programStageDataElements)) {
        const coordElement = programStageDataElements.find(
            (d) => d.dataElement.id === fieldId
        )
        if (coordElement) {
            return {
                name: coordElement.dataElement.name,
                valueType: coordElement.dataElement.valueType,
            }
        }
    }

    const { program: programData } = await engine.query(
        EVENT_PROGRAM_ATTRIBUTES_QUERY,
        {
            variables: {
                id: program.id,
                nameProperty: displayNameProp,
            },
        }
    )
    const { programTrackedEntityAttributes } = programData
    if (Array.isArray(programTrackedEntityAttributes)) {
        const coordAttribute = programTrackedEntityAttributes.find(
            (d) => d.trackedEntityAttribute.id === fieldId
        )
        if (coordAttribute) {
            return {
                name: coordAttribute.trackedEntityAttribute.name,
                valueType: coordAttribute.trackedEntityAttribute.valueType,
            }
        }
    }

    return undefined
}

export const resolveGeometrySourceName = (id, geometrySourceNames) =>
    geometrySourceNames?.[id] ?? id

export const getDefaultGeometrySourceColor = (
    id,
    { eventCoordinateField, fallbackCoordinateField }
) => {
    if (GEOMETRY_SOURCE_COLORS[id]) {
        return GEOMETRY_SOURCE_COLORS[id]
    }
    if (id === eventCoordinateField) {
        return qualitativeColors[4]
    }
    if (id === fallbackCoordinateField) {
        return qualitativeColors[5]
    }
    return qualitativeColors[0]
}

const expandField = (fieldId, hasTei) => {
    if (fieldId === EVENT_COORDINATE_CASCADING) {
        return hasTei
            ? [
                  EVENT_COORDINATE_ENROLLMENT,
                  EVENT_COORDINATE_DEFAULT,
                  EVENT_COORDINATE_TRACKED_ENTITY,
                  EVENT_COORDINATE_ORG_UNIT,
              ]
            : [EVENT_COORDINATE_DEFAULT, EVENT_COORDINATE_ORG_UNIT]
    }
    return [fieldId]
}

export const loadHasTrackedEntityType = async ({ program, engine }) => {
    const { program: programData } = await engine.query(
        EVENT_PROGRAM_TRACKED_ENTITY_TYPE_QUERY,
        { variables: { id: program.id } }
    )
    return !!programData?.trackedEntityType?.id
}

export const getPossibleGeometrySources = (
    eventCoordinateField,
    fallbackCoordinateField,
    hasTei
) => {
    const main = expandField(
        eventCoordinateField ?? EVENT_COORDINATE_DEFAULT,
        hasTei
    )
    const fallback =
        fallbackCoordinateField && fallbackCoordinateField !== NONE
            ? expandField(fallbackCoordinateField, hasTei)
            : []
    return [...new Set([...main, ...fallback])]
}
