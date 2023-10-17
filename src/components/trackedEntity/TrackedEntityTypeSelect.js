import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

// Load all tracked entity types
const TRACKED_ENTITY_TYPES_QUERY = {
    types: {
        resource: 'trackedEntityTypes',
        params: {
            fields: ['id', 'displayName~rename(name)'],
            paging: false,
        },
    },
}

const TrackedEntityTypeSelect = ({
    trackedEntityType,
    onChange,
    className,
    errorText,
}) => {
    const { loading, error, data } = useDataQuery(TRACKED_ENTITY_TYPES_QUERY)

    return (
        <SelectField
            label={i18n.t('Tracked Entity Type')}
            loading={loading}
            items={data?.types.trackedEntityTypes}
            value={trackedEntityType?.id}
            onChange={onChange}
            className={className}
            errorText={
                error?.message ||
                (!trackedEntityType && errorText ? errorText : null)
            }
            dataTest="tetypeselect"
        />
    )
}

TrackedEntityTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    trackedEntityType: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default TrackedEntityTypeSelect
