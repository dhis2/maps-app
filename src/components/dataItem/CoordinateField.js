import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useProgramStageDataElements } from '../../hooks/useProgramStageDataElements.js'
import { useProgramTrackedEntityAttributes } from '../../hooks/useProgramTrackedEntityAttributes.js'
import { combineDataItems } from '../../util/analytics.js'
import { SelectField } from '../core/index.js'

const EVENT_COORDINATE_FIELD_ID = 'event'

const CoordinateField = ({
    value,
    program,
    programStage,
    onChange,
    className,
}) => {
    const { dataElements, setProgramStageIdForDataElements } =
        useProgramStageDataElements()
    const { programAttributes, setProgramIdForProgramAttributes } =
        useProgramTrackedEntityAttributes()

    useEffect(() => {
        if (program) {
            setProgramIdForProgramAttributes(program.id)
        }
        if (programStage) {
            setProgramStageIdForDataElements(programStage.id)
        }
    }, [
        program,
        programStage,
        setProgramIdForProgramAttributes,
        setProgramStageIdForDataElements,
    ])

    useEffect(() => {
        if (program) {
            onChange(EVENT_COORDINATE_FIELD_ID)
        }
    }, [program, onChange])

    if (dataElements === null || programAttributes === null) {
        return null
    }

    const fields = [
        { id: EVENT_COORDINATE_FIELD_ID, name: i18n.t('Event location') },
        ...combineDataItems(programAttributes, dataElements, ['COORDINATE']),
    ]

    return (
        <SelectField
            label={i18n.t('Coordinate field')}
            items={fields}
            value={
                fields.find((f) => f.id === value)
                    ? value
                    : EVENT_COORDINATE_FIELD_ID
            }
            onChange={(field) => onChange(field.id)}
            className={className}
        />
    )
}

CoordinateField.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    program: PropTypes.object,
    programStage: PropTypes.object,
    value: PropTypes.string,
}

export default CoordinateField
