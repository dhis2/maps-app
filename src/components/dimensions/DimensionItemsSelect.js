import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { loadDimensionItems } from '../../actions/dimensions';
import styles from './styles/DimensionItemsSelect.module.css';

const DimensionItemsSelect = ({
    dimension,
    items,
    value,
    onChange,
    loadDimensionItems,
}) => {
    useEffect(() => {
        if (dimension && !items) {
            loadDimensionItems(dimension);
        }
    }, [dimension, items, loadDimensionItems]);

    if (!items) {
        return null;
    }

    const onDimensionItemClick = ids =>
        onChange(ids.map(id => items.find(item => item.id === id)));

    return (
        <SelectField
            label={i18n.t('Items')}
            items={items}
            value={value}
            multiple={true}
            onChange={onDimensionItemClick}
            className={styles.select}
        />
    );
};

DimensionItemsSelect.propTypes = {
    dimension: PropTypes.string,
    items: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    loadDimensionItems: PropTypes.func.isRequired,
};

export default connect(
    ({ dimensions }, { dimension }) => ({
        items:
            dimensions && dimension
                ? dimensions.find(dim => dim.id === dimension).items
                : null,
    }),
    { loadDimensionItems }
)(DimensionItemsSelect);
