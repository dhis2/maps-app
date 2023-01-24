import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useEventDataItems } from '../../hooks/useEventDataItems.js'
import { SelectField } from '../core/index.js'

const EVENT_COORDINATE_FIELD_ID = 'event'

const includeTypes = ['COORDINATE']

const CoordinateField = ({
    value,
    program,
    programStage,
    onChange,
    className,
}) => {
    const { eventDataItems, loading } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
        includeTypes,
    })

    if (loading) {
        return null
    }

    let fields = [
        { id: EVENT_COORDINATE_FIELD_ID, name: i18n.t('Event location') },
    ]

    fields = eventDataItems ? fields.concat(eventDataItems) : fields

    if (value && !fields.find((f) => f.id === value)) {
        return null
    }

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
