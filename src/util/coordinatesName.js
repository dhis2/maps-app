import { COORDINATE_FIELD_NAMES } from '../constants/layers.js'
import {
    EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
    EVENT_PROGRAM_ATTRIBUTES_QUERY,
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
