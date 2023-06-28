import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'
import { useUserSettings } from '../UserSettingsProvider.js'

// Load all calculations
const CALCULATIONS_QUERY = {
    calculations: {
        resource: 'expressionDimensionItems',
        params: ({ nameProperty }) => ({
            fields: [
                'id',
                `${nameProperty}~rename(name)`,
                'trackedEntityType[id,displayName~rename(name)]',
            ],
            paging: false,
        }),
    },
}

const CalculationSelect = ({ calculation, className, errorText, onChange }) => {
    const { nameProperty } = useUserSettings()
    const { loading, error, data } = useDataQuery(CALCULATIONS_QUERY, {
        variables: { nameProperty },
    })

    const items = data?.calculations.expressionDimensionItems
    const value = calculation?.id

    return (
        <SelectField
            label={i18n.t('Calculation')}
            loading={loading}
            items={items}
            value={value}
            onChange={(dataItem) => onChange(dataItem, 'calculation')}
            className={className}
            errorText={
                error?.message || (!calculation && errorText ? errorText : null)
            }
            dataTest="calculationselect"
        />
    )
}

CalculationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    calculation: PropTypes.object,
    className: PropTypes.string,
    errorText: PropTypes.string,
}

export default CalculationSelect
