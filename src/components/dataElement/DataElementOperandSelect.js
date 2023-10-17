import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { SelectField } from '../core/index.js'
import { useUserSettings } from '../UserSettingsProvider.js'

// Load all data elements within a group
const DATA_ELEMENT_OPERAND_QUERY = {
    operands: {
        resource: 'dataElementOperands',
        params: ({ groupId, nameProperty }) => ({
            filter: `dataElement.dataElementGroups.id:eq:${groupId}`,
            fields: ['id', `${nameProperty}~rename(name)`],
            paging: false,
        }),
    },
}

const DataElementOperandSelect = ({
    dataElement,
    dataElementGroup,
    onChange,
    className,
    errorText,
}) => {
    const { nameProperty } = useUserSettings()
    const { loading, error, data, refetch } = useDataQuery(
        DATA_ELEMENT_OPERAND_QUERY,
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

    let items = data?.operands.dataElementOperands

    if (!items && dataElement) {
        items = [dataElement] // If favorite is loaded, we only know the used data element
    }

    return (
        <SelectField
            label={i18n.t('Data element operand')}
            loading={loading}
            items={items}
            value={dataElement?.id}
            onChange={(dataElement) => onChange(dataElement, 'operand')}
            className={className}
            errorText={
                error?.message || (!dataElement && errorText ? errorText : null)
            }
        />
    )
}

DataElementOperandSelect.propTypes = {
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

export default DataElementOperandSelect
