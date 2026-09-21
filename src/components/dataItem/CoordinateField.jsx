import { useConfig } from '@dhis2/app-runtime'
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
import {
    coordinateValueTypes,
    ouValueTypes,
} from '../../constants/valueTypes.js'
import {
    serverSupportsGeometrySource,
    serverSupportsOrgUnitCoordinateField,
} from '../../util/versionToggle.js'
import { SelectField } from '../core/index.js'
import { useEventDataItems } from './EventDataItemsProvider.jsx'

const getIncludeTypes = (isFallback, serverVersion) => {
    const includeTypes = [...coordinateValueTypes]

    if (isFallback) {
        // VERSION-TOGGLE: fallbackCoordinateField pointed at a custom
        // ORGANISATION_UNIT field crashes pre-2.44 - see util/versionToggle.js
        if (serverSupportsGeometrySource(serverVersion)) {
            includeTypes.push(...ouValueTypes)
        }
        return includeTypes
    }

    // VERSION-TOGGLE: ORGANISATION_UNIT isn't a valid coordinate field
    // pre-2.40.8/2.41.4/2.42 - see util/versionToggle.js
    if (serverSupportsOrgUnitCoordinateField(serverVersion)) {
        includeTypes.push(...ouValueTypes)
    }

    return includeTypes
}

const getHelpText = ({ program, programStage, value, trackedEntityType }) => {
    if (!program) {
        return i18n.t('Select a program to see additional coordinate options')
    }

    if (value === EVENT_COORDINATE_CASCADING) {
        return trackedEntityType?.id
            ? i18n.t(
                  'Event > enrollment > tracked entity > org unit coordinate'
              )
            : i18n.t('Event > org unit coordinate')
    }

    if (!programStage && trackedEntityType?.id) {
        return i18n.t(
            'Select a program stage to see additional coordinate options'
        )
    }

    return null
}

const CoordinateField = ({
    value,
    type,
    program,
    programStage,
    eventCoordinateField,
    onChange,
    className,
    dataTest = 'coordinatefield',
}) => {
    const { serverVersion } = useConfig()
    const isFallback = !!eventCoordinateField
    const includeTypes = getIncludeTypes(isFallback, serverVersion)

    const {
        eventDataItems,
        trackedEntityType,
        loading: itemsLoading,
    } = useEventDataItems({ includeTypes })

    const defaultValue = useMemo(
        () => (eventCoordinateField ? NONE : EVENT_COORDINATE_DEFAULT),
        [eventCoordinateField]
    )

    const fields = useMemo(() => {
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
            id: EVENT_COORDINATE_ORG_UNIT,
            name: i18n.t('Organisation unit location'),
        })
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

        return isFallback
            ? fields.filter((f) => f.id !== eventCoordinateField)
            : fields
    }, [trackedEntityType, eventDataItems, eventCoordinateField, isFallback])

    const helpText = getHelpText({
        program,
        programStage,
        value,
        trackedEntityType,
    })

    // Initiate type when editing saved layer
    useEffect(() => {
        if (type === undefined && eventDataItems != null) {
            const selectedField = fields.find((f) => f.id === value)
            const selectedId = selectedField?.id || defaultValue
            const selectedType = selectedField?.valueType || selectedId
            onChange(selectedId, selectedType)
        }
    }, [type, eventDataItems, fields, value, defaultValue, onChange])

    // Reset default value when program or programStage is changed and prev value is not available anymore
    useEffect(() => {
        if (
            trackedEntityType &&
            eventDataItems &&
            !fields.some((f) => f.id === value) &&
            value !== defaultValue &&
            fields.length > 0
        ) {
            onChange(defaultValue, defaultValue)
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
        <SelectField
            label={
                eventCoordinateField
                    ? i18n.t('Fallback coordinate field')
                    : i18n.t('Coordinate field')
            }
            items={fields}
            value={fields.some((f) => f.id === value) ? value : null}
            loading={
                !!program && value !== EVENT_COORDINATE_DEFAULT && itemsLoading
            }
            helpText={helpText}
            onChange={(field) =>
                onChange(field.id, field.valueType || field.id)
            }
            className={className}
            dataTest={dataTest}
        />
    )
}

CoordinateField.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dataTest: PropTypes.string,
    eventCoordinateField: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
    ]),
    program: PropTypes.object,
    programStage: PropTypes.object,
    type: PropTypes.string,
    value: PropTypes.string,
}

export default CoordinateField
