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
    className,
}) => {
    const { nameProperty } = useCachedDataQuery()
    const { loading, error, data } = useDataQuery(ORG_UNIT_GROUP_SETS_QUERY, {
        variables: { nameProperty },
    })

    const ITEM_NONE = { id: 'none', name: i18n.t('None') }

    const onGroupSetChange = useCallback(
        (item) => onChange(item.id !== 'none' ? item : undefined),
        [onChange]
    )
 
    const groupSets = useMemo(
        () => [
            ...(allowNone ? [ITEM_NONE] : []),
            ...(data?.sets.organisationUnitGroupSets || []),
        ],
        [data, allowNone]
    )

    const internalError =
        value && !groupSets.find((item) => item.id === value.id)
    let internalErrorText
    if (internalError) {
        internalErrorText = i18n.t(
            'Previously selected value not available in list: {{id}}',
            {
                id: value.id,
                nsSeparator: '^^',
            }
        )
    }

    let selectValue = null
    if (!(error || internalError)) {
        selectValue = value ? value.id : ITEM_NONE.id
    }

    return (
        <SelectField
            label={label}
            loading={loading}
            items={groupSets}
            value={selectValue}
            onChange={onGroupSetChange}
            errorText={internalErrorText || error?.message}
            className={className}
            dataTest="orgunitgroupsetselect"
        />
    )
}

GroupSetSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    allowNone: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.object,
}

export default GroupSetSelect
