import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SelectField } from '../core/index.js'

// Load all data elements within a group
const DATA_ELEMENTS_QUERY = {
    dataElements: {
        resource: 'dataElements',
        params: ({ groupId, nameProperty }) => ({
            filter: `dataElementGroups.id:eq:${groupId}`,
            fields: [
                'dimensionItem~rename(id)',
                `${nameProperty}~rename(name)`,
            ],
            domainType: 'aggregate',
            paging: false,
        }),
    },
}

const DataElementSelect = ({
    dataElement,
    dataElementGroup,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useCachedData()
    const { loading, error, data, refetch } = useDataQuery(
        DATA_ELEMENTS_QUERY,
        {
            lazy: true,
        }
    )

    useEffect(() => {
        if (dataElementGroup) {
            refetch({
                groupId: dataElementGroup.id,
                nameProperty,
            })
        }
    }, [dataElementGroup, nameProperty, refetch])

    if (!dataElementGroup && !dataElement) {
        return null
    }

    let items = data?.dataElements.dataElements

    if (!items && dataElement) {
        items = [dataElement] // If favorite is loaded, we only know the used data element
    }

    return (
        <SelectField
            label={i18n.t('Data element')}
            loading={loading}
            items={items}
            value={dataElement?.id}
            onChange={(dataElement) => onChange(dataElement, 'dataElement')}
            className={className}
            errorText={
                error?.message || (!dataElement && errorText ? errorText : null)
            }
            dataTest="dataelementselect"
        />
    )
}

DataElementSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dataElement: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    dataElementGroup: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }),
    errorText: PropTypes.string,
}

export default DataElementSelect
