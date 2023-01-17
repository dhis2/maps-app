import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'
import { useUserSettings } from '../UserSettingsProvider.js'

// Load org unit groups
const ORG_UNIT_GROUPS_QUERY = {
    groups: {
        resource: 'organisationUnitGroups',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const style = {
    width: '100%',
    marginTop: -12,
}

const OrgUnitGroupSelect = ({ orgUnitGroup, disabled, onChange }) => {
    const { nameProperty } = useUserSettings()
    const { loading, error, data } = useDataQuery(ORG_UNIT_GROUPS_QUERY, {
        variables: { nameProperty },
    })

    return (
        <SelectField
            label={i18n.t('Select groups')}
            loading={loading}
            items={data?.groups.organisationUnitGroups}
            value={orgUnitGroup}
            multiple={true}
            onChange={onChange}
            style={style}
            errorText={error?.message}
            disabled={disabled}
            data-test="orgunitgroupselect"
        />
    )
}

OrgUnitGroupSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    orgUnitGroup: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
}

export default OrgUnitGroupSelect
