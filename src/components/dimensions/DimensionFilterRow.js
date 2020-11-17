import React from 'react';
import PropTypes from 'prop-types';
import DimensionSelect from './DimensionSelect';
import DimensionItemsSelect from './DimensionItemsSelect';
import RemoveFilter from '../filter/RemoveFilter';
import styles from './styles/DimensionFilterRow.module.css';

const DimensionFilterRow = ({
    dimension,
    items,
    index,
    onChange,
    onRemove,
}) => {
    const onSelect = (dimension, items) =>
        onChange(index, { dimension, items });

    return (
        <div className={styles.filterRow}>
            <DimensionSelect
                dimension={dimension}
                onChange={selectedDimension => onSelect(selectedDimension.id)}
            />
            <DimensionItemsSelect
                dimension={dimension}
                value={items ? items.map(item => item.id) : null}
                onChange={items => onSelect(dimension, items)}
            />
            <RemoveFilter onClick={() => onRemove(index)} />
        </div>
    );
};

DimensionFilterRow.propTypes = {
    dimension: PropTypes.string,
    items: PropTypes.array,
    index: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default DimensionFilterRow;
