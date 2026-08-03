import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SelectField } from '../core/index.js'

// Load all tracked entity types
const TRACKED_ENTITY_TYPES_QUERY = {
    types: {
        resource: 'trackedEntityTypes',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const TrackedEntityTypeSelect = ({
    trackedEntityType,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useCachedData()
    const { loading, error, data } = useDataQuery(TRACKED_ENTITY_TYPES_QUERY, {
        variables: { nameProperty },
    })

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
