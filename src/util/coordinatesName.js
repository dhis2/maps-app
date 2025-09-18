import { COORDINATE_FIELD_NAMES } from '../constants/layers.js'
import {
    EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
    EVENT_PROGRAM_ATTRIBUTES_QUERY,
} from '../util/event.js'

export const loadEventCoordinateFieldName = async ({
    program,
    programStage,
    eventCoordinateField,
    engine,
    displayNameProp,
}) => {
    if (!eventCoordinateField) {
        return
    }

    if (COORDINATE_FIELD_NAMES[eventCoordinateField]) {
        return COORDINATE_FIELD_NAMES[eventCoordinateField]
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
            (d) => d.dataElement.id === eventCoordinateField
        )
        if (coordElement) {
            return coordElement.dataElement.name
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
            (d) => d.trackedEntityAttribute.id === eventCoordinateField
        )
        if (coordAttribute) {
            return coordAttribute.trackedEntityAttribute.name
        }
    }
}
