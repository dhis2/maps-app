import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
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
    const { eventDataItems } = useEventDataItems({
        programId: program?.id,
        programStageId: programStage?.id,
        includeTypes,
    })

    useEffect(() => {
        if (program) {
            onChange(EVENT_COORDINATE_FIELD_ID)
        }
    }, [program, onChange])

    let fields = [
        { id: EVENT_COORDINATE_FIELD_ID, name: i18n.t('Event location') },
    ]

    fields = eventDataItems ? fields.concat(eventDataItems) : fields

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
