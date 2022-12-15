import PropTypes from 'prop-types'
import React from 'react'
import { SortIndicator } from 'react-virtualized'
import FilterInput from './FilterInput.js'
import styles from './styles/ColumnHeader.module.css'

// Replacement for https://github.com/bvaughn/react-virtualized/blob/master/source/Table/defaultHeaderRenderer.js

const ColumnHeader = ({ dataKey, label, type, sortBy, sortDirection }) => (
    <div title={label} className={styles.columnHeader}>
        <span className={styles.label}>{label}</span>
        {sortBy === dataKey ? (
            <SortIndicator sortDirection={sortDirection} />
        ) : null}
        <FilterInput type={type} dataKey={dataKey} />
    </div>
)

ColumnHeader.propTypes = {
    dataKey: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortBy: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
}

export default ColumnHeader
