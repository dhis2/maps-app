import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { SelectField } from '../core/index.js'

// Load all data sets (reporting rates)
const DATA_SETS_QUERY = {
    sets: {
        resource: 'dataSets',
        params: {
            fields: [
                'dimensionItem~rename(id)',
                'displayName~rename(name)',
                'legendSet[id]',
            ],
            paging: false,
        },
    },
}

const DataSetsSelect = ({ dataSet, onChange, className, errorText }) => {
    const { loading, error, data } = useDataQuery(DATA_SETS_QUERY)

    const dataSetId = dataSet ? dataSet.id.split('.')[0] : null // Remove ".REPORTING_RATE"

    return (
        <SelectField
            label={i18n.t('Data set')}
            loading={loading}
            items={data?.sets.dataSets}
            value={dataSetId}
            onChange={(dataSet) => onChange(dataSet, 'reportingRate')} // Reporting rates
            className={className}
            errorText={
                error?.message || (!dataSet && errorText ? errorText : null)
            }
        />
    )
}

DataSetsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dataSet: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    errorText: PropTypes.string,
}

export default DataSetsSelect
