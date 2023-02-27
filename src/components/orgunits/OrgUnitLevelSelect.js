import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { isValidUid } from '../../util/helpers.js'
import { SelectField } from '../core/index.js'

// Load org unit levels
const ORG_UNIT_LEVELS_QUERY = {
    levels: {
        resource: 'organisationUnitLevels',
        params: {
            fields: ['id', 'displayName~rename(name)', 'level'],
            order: `level:asc`,
            paging: false,
        },
    },
}

// Converts "LEVEL-x" to newer "LEVEL-uid" format
// TODO: use method from analytics library or get rid of old format in a db upgrade
const getOrgUnitLevelUid = (orgUnitLevel = [], orgUnitLevels) =>
    orgUnitLevels
        ? orgUnitLevel
              .filter((level) =>
                  orgUnitLevels.find(
                      (l) => l.id === level || l.level === Number(level)
                  )
              )
              .map((level) =>
                  isValidUid(level)
                      ? level
                      : orgUnitLevels.find((l) => l.level === Number(level)).id
              )
        : []

const style = {
    marginTop: 0,
    marginBottom: 24,
}

const OrgUnitLevelSelect = ({ orgUnitLevel, disabled, onChange }) => {
    const { loading, error, data } = useDataQuery(ORG_UNIT_LEVELS_QUERY)
    const value = getOrgUnitLevelUid(
        orgUnitLevel,
        data?.levels.organisationUnitLevels
    )

    return (
        <SelectField
            label={i18n.t('Select levels')}
            loading={loading}
            items={data?.levels.organisationUnitLevels}
            value={value}
            multiple={true}
            onChange={onChange}
            style={style}
            disabled={disabled}
            errorText={error?.message}
            dataTest="orgunitlevelselect"
        />
    )
}

OrgUnitLevelSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    orgUnitLevel: PropTypes.array,
}

export default OrgUnitLevelSelect
