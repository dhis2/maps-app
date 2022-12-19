import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
} from '../../actions/programs.js'
import {
    EVENT_COORDINATE_DEFAULT,
    EVENT_COORDINATE_ENROLLMENT,
    EVENT_COORDINATE_TRACKED_ENTITY,
    EVENT_COORDINATE_ORG_UNIT,
    EVENT_COORDINATE_CASCADING,
    NONE,
} from '../../constants/layers.js'
import { SelectField } from '../core/index.js'

const CoordinateField = ({
    value,
    program,
    programStage,
    programAttributes,
    dataElements,
    eventCoordinateField,
    loadProgramTrackedEntityAttributes,
    loadProgramStageDataElements,
    onChange,
    className,
}) => {
    const [hasDefaultValue, setHasDefaulValue] = useState(false)
    const isTrackerProgram = !!program?.trackedEntityType

    const defaultValue = eventCoordinateField
        ? EVENT_COORDINATE_CASCADING
        : EVENT_COORDINATE_DEFAULT

    const programFields = useMemo(
        () =>
            program && programStage
                ? [
                      ...(programAttributes[program.id] || []),
                      ...(dataElements[programStage.id] || []),
                  ].filter((field) => field.valueType === 'COORDINATE')
                : [],
        [program, programStage, programAttributes, dataElements]
    )

    const fields = useMemo(() => {
        const isFallback = !!eventCoordinateField
        const fields = []

        if (isFallback) {
            fields.push({
                id: NONE,
                name: i18n.t('None'),
            })
            fields.push({
                id: EVENT_COORDINATE_CASCADING,
                name: i18n.t('Cascading'),
            })
        }

        fields.push({
            id: EVENT_COORDINATE_DEFAULT,
            name: i18n.t('Event location'),
        })

        if (isTrackerProgram) {
            fields.push({
                id: EVENT_COORDINATE_ENROLLMENT,
                name: i18n.t('Enrollment location'),
            })
            fields.push({
                id: EVENT_COORDINATE_TRACKED_ENTITY,
                name: i18n.t('Tracked entity location'),
            })
        }

        fields.push(...programFields)

        if (isFallback) {
            fields.push({
                id: EVENT_COORDINATE_ORG_UNIT,
                name: i18n.t('Organisation unit location'),
            })
        }

        return eventCoordinateField
            ? fields.filter((f) => f.id !== eventCoordinateField)
            : fields
    }, [isTrackerProgram, programFields, eventCoordinateField])

    useEffect(() => {
        if (program && !programAttributes[program.id]) {
            loadProgramTrackedEntityAttributes(program.id)
        }
    }, [program, programAttributes, loadProgramTrackedEntityAttributes])

    useEffect(() => {
        if (programStage && !dataElements[programStage.id]) {
            loadProgramStageDataElements(programStage.id)
        }
    }, [programStage, dataElements, loadProgramStageDataElements])

    // Set default value
    useEffect(() => {
        if (!value && !hasDefaultValue) {
            onChange(eventCoordinateField ? NONE : EVENT_COORDINATE_DEFAULT)
        } else if (eventCoordinateField && eventCoordinateField === value) {
            // Make sure fallback coordinate is different from event coordinate
            onChange(NONE)
        }
        setHasDefaulValue(true)
    }, [value, eventCoordinateField, hasDefaultValue, onChange])

    const foundValue = fields.find((f) => f.id === value)
        ? value
        : eventCoordinateField
        ? NONE
        : EVENT_COORDINATE_DEFAULT

    return (
        <div className={className}>
            <SelectField
                label={
                    eventCoordinateField
                        ? i18n.t('Fallback coordinate field')
                        : i18n.t('Coordinate field')
                }
                items={fields}
                value={foundValue}
                helpText={
                    foundValue === EVENT_COORDINATE_CASCADING
                        ? i18n.t(
                              'Enrollment > event > tracked entity > org unit coordinate'
                          )
                        : null
                }
                onChange={(field) => onChange(field.id)}
            />
        </div>
    )
}

CoordinateField.propTypes = {
    dataElements: PropTypes.object.isRequired,
    loadProgramStageDataElements: PropTypes.func.isRequired,
    loadProgramTrackedEntityAttributes: PropTypes.func.isRequired,
    programAttributes: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    eventCoordinateField: PropTypes.string,
    program: PropTypes.object,
    programStage: PropTypes.object,
    value: PropTypes.string,
}

export default connect(
    (state) => ({
        programAttributes: state.programTrackedEntityAttributes,
        dataElements: state.programStageDataElements,
    }),
    { loadProgramTrackedEntityAttributes, loadProgramStageDataElements }
)(CoordinateField)
