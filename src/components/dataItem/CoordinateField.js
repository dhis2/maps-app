import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useEffect } from 'react'
import {
    EVENT_COORDINATE_DEFAULT,
    EVENT_COORDINATE_ENROLLMENT,
    EVENT_COORDINATE_TRACKED_ENTITY,
    EVENT_COORDINATE_ORG_UNIT,
    EVENT_COORDINATE_CASCADING,
    NONE,
} from '../../constants/layers.js'
import { useEventDataItems } from '../../hooks/useEventDataItems.js'
import { SelectField } from '../core/index.js'

const includeTypes = ['COORDINATE']

const CoordinateField = ({
    value,
    program,
    programStage,
    eventCoordinateField,
    onChange,
    className,
}) => {
    const { eventDataItems, trackedEntityType } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
        includeTypes,
    })

    const defaultValue = eventCoordinateField ? NONE : EVENT_COORDINATE_DEFAULT

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

        if (!trackedEntityType) {
            return fields
        }

        if (trackedEntityType?.id) {
            fields.push({
                id: EVENT_COORDINATE_ENROLLMENT,
                name: i18n.t('Enrollment location'),
            })
            fields.push({
                id: EVENT_COORDINATE_TRACKED_ENTITY,
                name: i18n.t('Tracked entity location'),
            })
        }

        if (eventDataItems) {
            fields.push(...eventDataItems)
        }

        if (isFallback) {
            fields.push({
                id: EVENT_COORDINATE_ORG_UNIT,
                name: i18n.t('Organisation unit location'),
            })
        }

        return eventCoordinateField
            ? fields.filter((f) => f.id !== eventCoordinateField)
            : fields
    }, [trackedEntityType, eventDataItems, eventCoordinateField])

    // Reset default value when program or programStage is changed and prev value is not available anymore
    useEffect(() => {
        if (
            trackedEntityType &&
            eventDataItems &&
            !fields.find((f) => f.id === value)
        ) {
            onChange(defaultValue)
        }
    }, [
        trackedEntityType,
        eventDataItems,
        fields,
        value,
        defaultValue,
        onChange,
    ])

    return (
        <div className={className}>
            <SelectField
                label={
                    eventCoordinateField
                        ? i18n.t('Fallback coordinate field')
                        : i18n.t('Coordinate field')
                }
                items={fields}
                value={fields.find((f) => f.id === value) ? value : null}
                loading={
                    value !== EVENT_COORDINATE_DEFAULT && !trackedEntityType
                }
                helpText={
                    value === EVENT_COORDINATE_CASCADING
                        ? trackedEntityType
                            ? i18n.t(
                                  'Enrollment > event > tracked entity > org unit coordinate'
                              )
                            : i18n.t('Event > org unit coordinate')
                        : null
                }
                onChange={(field) => onChange(field.id)}
            />
        </div>
    )
}

CoordinateField.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    eventCoordinateField: PropTypes.string,
    program: PropTypes.object,
    programStage: PropTypes.object,
    value: PropTypes.string,
}

export default CoordinateField
