import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { loadDimensionItems } from '../../actions/dimensions.js'
import { SelectField } from '../core/index.js'
import styles from './styles/DimensionItemsSelect.module.css'

const DimensionItemsSelect = ({
    dimension,
    items,
    value,
    onChange,
    loadDimensionItems,
}) => {
    useEffect(() => {
        if (dimension && !items) {
            loadDimensionItems(dimension)
        }
    }, [dimension, items, loadDimensionItems])

    if (!items) {
        return null
    }

    const onDimensionItemClick = (ids) =>
        onChange(ids.map((id) => items.find((item) => item.id === id)))

    return (
        <SelectField
            label={i18n.t('Items')}
            items={items}
            value={value}
            multiple={true}
            onChange={onDimensionItemClick}
            className={styles.select}
        />
    )
}

DimensionItemsSelect.propTypes = {
    loadDimensionItems: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    items: PropTypes.array,
    value: PropTypes.array,
}

export default connect(
    ({ dimensions }, { dimension }) => ({
        items:
            dimensions && dimension
                ? dimensions.find((dim) => dim.id === dimension).items
                : null,
    }),
    { loadDimensionItems }
)(DimensionItemsSelect)
