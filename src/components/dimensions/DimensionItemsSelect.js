import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { SelectField } from '../core/index.js'
import { useUserSettings } from '../UserSettingsProvider.js'
import styles from './styles/DimensionItemsSelect.module.css'

// Load dimension items
const DIMENSION_ITEMS_QUERY = {
    items: {
        resource: 'dimensions',
        id: ({ id }) => `${id}/items`,
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            order: 'displayName:asc',
            paging: false,
        }),
    },
}

const DimensionItemsSelect = ({ dimension, value, onChange }) => {
    const { nameProperty } = useUserSettings()
    const { loading, error, data, refetch } = useDataQuery(
        DIMENSION_ITEMS_QUERY,
        {
            lazy: true,
        }
    )

    useEffect(() => {
        if (dimension) {
            refetch({
                id: dimension,
                nameProperty,
            })
        }
    }, [dimension, nameProperty, refetch])

    const onDimensionItemClick = (ids) =>
        onChange(
            ids.map((id) => data.items.items.find((item) => item.id === id))
        )

    return (
        <SelectField
            label={i18n.t('Items')}
            loading={loading}
            items={data?.items.items}
            value={value}
            multiple={true}
            onChange={onDimensionItemClick}
            errorText={error?.message}
            className={styles.select}
        />
    )
}

DimensionItemsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    value: PropTypes.array,
}

export default DimensionItemsSelect
