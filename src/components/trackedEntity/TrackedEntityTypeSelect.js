import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

const query = {
    trackedEntityTypes: {
        resource: 'trackedEntityTypes',
        params: {
            fields: 'id,displayName~rename(name)',
        },
    },
}

const TrackedEntityTypeSelect = ({
    trackedEntityType,
    onChange,
    className,
    errorText,
}) => {
    const { loading, data, error } = useDataQuery(query)

    return (
        <SelectField
            label={i18n.t('Tracked Entity Type')}
            loading={loading}
            items={data?.trackedEntityTypes.trackedEntityTypes}
            value={trackedEntityType ? trackedEntityType.id : null}
            onChange={(trackedEntityType) => onChange(trackedEntityType)}
            className={className}
            errorText={error && errorText ? errorText : null}
            dataTest="tetypeselect"
        />
    )
}

TrackedEntityTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    trackedEntityType: PropTypes.object,
}

export default TrackedEntityTypeSelect
