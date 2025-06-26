import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.js'
import { SelectField } from '../core/index.js'

// Load all data element groups
const DATA_ELEMENT_GROUPS_QUERY = {
    groups: {
        resource: 'dataElementGroups',
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const DataElementGroupSelect = ({
    dataElementGroup,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useCachedData()
    const { loading, error, data } = useDataQuery(DATA_ELEMENT_GROUPS_QUERY, {
        variables: { nameProperty },
    })

    return (
        <SelectField
            label={i18n.t('Data element group')}
            loading={loading}
            items={data?.groups.dataElementGroups}
            value={dataElementGroup?.id}
            onChange={onChange}
            className={className}
            errorText={
                error?.message ||
                (!dataElementGroup && errorText ? errorText : null)
            }
            dataTest="dataelementgroupselect"
        />
    )
}

DataElementGroupSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dataElementGroup: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    errorText: PropTypes.string,
}

export default DataElementGroupSelect
