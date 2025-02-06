import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useCallback } from 'react'
import { SelectField } from '../core/index.js'

// Load org unit group sets
const ORG_UNIT_GROUP_SETS_QUERY = {
    sets: {
        resource: 'organisationUnitGroupSets',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const GroupSetSelect = ({
    label = i18n.t('Group set'),
    value,
    allowNone,
    onChange,
    errorText,
    className,
}) => {
    const { nameProperty } = useCachedDataQuery()
    const { loading, error, data } = useDataQuery(ORG_UNIT_GROUP_SETS_QUERY, {
        variables: { nameProperty },
    })

    const groupSets = useMemo(
        () => [
            ...(allowNone ? [{ id: 'none', name: i18n.t('None') }] : []),
            ...(data?.sets.organisationUnitGroupSets || []),
        ],
        [data, allowNone]
    )

    const onGroupSetChange = useCallback(
        (item) => onChange(item.id !== 'none' ? item : undefined),
        [onChange]
    )

    return (
        <SelectField
            label={label}
            loading={loading}
            items={groupSets}
            value={value ? value.id : null}
            onChange={onGroupSetChange}
            errorText={
                error?.message || (!value && errorText ? errorText : null)
            }
            className={className}
            dataTest="orgunitgroupsetselect"
        />
    )
}

GroupSetSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    allowNone: PropTypes.bool,
    className: PropTypes.string,
    errorText: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.object,
}

export default GroupSetSelect
