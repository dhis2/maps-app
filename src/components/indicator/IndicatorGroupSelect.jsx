import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

// Load all indicator groups
const INDICATOR_GROUPS_QUERY = {
    groups: {
        resource: 'indicatorGroups',
        params: {
            fields: ['id', 'displayName~rename(name)'],
            paging: false,
        },
    },
}

const IndicatorGroupSelect = ({
    indicatorGroup,
    onChange,
    className,
    errorText,
}) => {
    const { loading, error, data } = useDataQuery(INDICATOR_GROUPS_QUERY)

    return (
        <SelectField
            label={i18n.t('Indicator group')}
            loading={loading}
            items={data?.groups.indicatorGroups}
            value={indicatorGroup?.id}
            onChange={onChange}
            className={className}
            errorText={
                error?.message ||
                (!indicatorGroup && errorText ? errorText : null)
            }
            dataTest="indicatorgroupselect"
        />
    )
}

IndicatorGroupSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    indicatorGroup: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
}

export default IndicatorGroupSelect
