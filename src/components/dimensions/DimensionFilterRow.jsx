import PropTypes from 'prop-types'
import React from 'react'
import RemoveFilter from '../filter/RemoveFilter.jsx'
import DimensionItemsSelect from './DimensionItemsSelect.jsx'
import DimensionSelect from './DimensionSelect.jsx'
import styles from './styles/DimensionFilterRow.module.css'

const DimensionFilterRow = ({
    dimension,
    items,
    index,
    onChange,
    onRemove,
}) => {
    const onSelect = (dimension, items) => onChange(index, { dimension, items })

    return (
        <div className={styles.filterRow}>
            <DimensionSelect
                dimension={dimension}
                onChange={(selectedDimension) => onSelect(selectedDimension.id)}
            />
            <DimensionItemsSelect
                dimension={dimension}
                value={items ? items.map((item) => item.id) : null}
                onChange={(items) => onSelect(dimension, items)}
            />
            <RemoveFilter onClick={() => onRemove(index)} />
        </div>
    )
}

DimensionFilterRow.propTypes = {
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    dimension: PropTypes.string,
    index: PropTypes.number,
    items: PropTypes.array,
}

export default DimensionFilterRow
