import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../../core/index.js'

const TRACKED_ENTITY_INSTANCE = 'TRACKED_ENTITY_INSTANCE'

// Only relationships between tracked entities can be shown
const RELATIONSHIP_TYPES_QUERY = {
    relationshipTypes: {
        resource: 'relationshipTypes',
        params: ({ trackedEntityType }) => ({
            fields: ['id', 'displayName~rename(name)'],
            filter: [
                `fromConstraint.relationshipEntity:eq:${TRACKED_ENTITY_INSTANCE}`,
                `toConstraint.relationshipEntity:eq:${TRACKED_ENTITY_INSTANCE}`,
                `fromConstraint.trackedEntityType.id:eq:${trackedEntityType}`,
            ],
            paging: false,
        }),
    },
}

const TrackedEntityRelationshipTypeSelect = ({
    trackedEntityType,
    value,
    onChange,
    className,
}) => {
    const { loading, data, error } = useDataQuery(RELATIONSHIP_TYPES_QUERY, {
        variables: { trackedEntityType: trackedEntityType.id },
    })

    const types = data?.relationshipTypes.relationshipTypes || []

    if (loading) {
        return <CircularLoader small />
    } else if (error) {
        return <span>{error.message}</span>
    }

    if (!types.length) {
        return (
            <div
                style={{
                    fontSize: 14,
                    fontStyle: 'italic',
                    marginLeft: 24,
                }}
            >
                {i18n.t(
                    'No relationship types were found for tracked entity type {{type}}',
                    { type: trackedEntityType.name }
                )}
            </div>
        )
    }

    return (
        <SelectField
            label={i18n.t('Relationship type')}
            items={types}
            value={value}
            onChange={(type) => onChange(type.id)}
            className={className}
        />
    )
}

TrackedEntityRelationshipTypeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    trackedEntityType: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }),
    value: PropTypes.string,
}

export default TrackedEntityRelationshipTypeSelect
