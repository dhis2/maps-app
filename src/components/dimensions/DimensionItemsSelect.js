import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.js'
import { SelectField } from '../core/index.js'
import styles from './styles/DimensionItemsSelect.module.css'

// Load dimension items
const DIMENSION_ITEMS_QUERY = {
    items: {
        resource: 'dimensions',
        id: ({ id }) => `${id}/items`,
        params: ({ nameProperty }) => ({
            fields: ['id', `${nameProperty}~rename(name)`],
            order: `${nameProperty}:asc`,
            paging: false,
        }),
    },
}

const DimensionItemsSelect = ({ dimension, value, onChange }) => {
    const { nameProperty } = useCachedData()
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

    const items = data?.items.items

    const foundValues =
        value && items
            ? value.filter((id) => items.find((f) => f.id === id))
            : undefined

    return (
        <SelectField
            label={i18n.t('Items')}
            loading={loading}
            items={items}
            value={foundValues}
            multiple={true}
            onChange={onDimensionItemClick}
            errorText={error?.message}
            className={styles.select}
            dataTest="dimension-items-select-field"
        />
    )
}

DimensionItemsSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    value: PropTypes.array,
}

export default DimensionItemsSelect
