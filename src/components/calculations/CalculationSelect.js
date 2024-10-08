import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField, Help } from '../core/index.js'
import styles from './styles/CalculationSelect.module.css'

// Load all calculations
const CALCULATIONS_QUERY = {
    calculations: {
        resource: 'dataItems',
        params: ({ nameProperty }) => ({
            filter: `dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM`,
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const CalculationSelect = ({ calculation, className, errorText, onChange }) => {
    const { nameProperty } = useCachedDataQuery()
    const { loading, error, data } = useDataQuery(CALCULATIONS_QUERY, {
        variables: { nameProperty },
    })

    const items = data?.calculations.dataItems
    const value = calculation?.id

    return (
        <div className={styles.calculationSelect}>
            <SelectField
                label={i18n.t('Calculation')}
                loading={loading}
                items={items}
                value={value}
                onChange={(dataItem) => onChange(dataItem, 'calculation')}
                className={className}
                emptyText={i18n.t('No calculations found')}
                errorText={
                    error?.message ||
                    (!calculation && errorText ? errorText : null)
                }
                filterable={true}
                dataTest="calculationselect"
            />
            <Help>
                {i18n.t(
                    'Calculations can be created in the Data Visualizer app.'
                )}
            </Help>
        </div>
    )
}

CalculationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    calculation: PropTypes.object,
    className: PropTypes.string,
    errorText: PropTypes.string,
}

export default CalculationSelect
