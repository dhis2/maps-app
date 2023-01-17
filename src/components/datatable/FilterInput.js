import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import styles from './styles/FilterInput.module.css'

// http://adazzle.github.io/react-data-grid/examples.html#/custom-filters
// https://github.com/adazzle/react-data-grid/tree/master/packages/react-data-grid-addons/src/cells/headerCells/filters
const FilterInput = ({
    layerId,
    type,
    dataKey,
    filters,
    setDataFilter,
    clearDataFilter,
}) => {
    const filterValue = filters[dataKey] || ''

    // https://stackoverflow.com/questions/36683770/react-how-to-get-the-value-of-an-input-field
    const onChange = (evt) => {
        const value = evt.target.value

        if (value !== '') {
            setDataFilter(layerId, dataKey, value)
        } else {
            clearDataFilter(layerId, dataKey, value)
        }
    }

    return (
        <input
            className={styles.filterInput}
            placeholder={type === 'number' ? '2,>3&<8' : 'Search'} // TODO: Support more field types
            value={filterValue}
            onClick={(evt) => evt.stopPropagation()}
            onChange={onChange}
        />
    )
}

FilterInput.propTypes = {
    clearDataFilter: PropTypes.func.isRequired,
    dataKey: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    layerId: PropTypes.string.isRequired,
    setDataFilter: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
}

// Avoid needing to pass filter and actions to every input field
const mapStateToProps = ({ dataTable, map }) => {
    const overlay = dataTable
        ? map.mapViews.filter((layer) => layer.id === dataTable)[0]
        : null

    if (overlay) {
        return {
            layerId: overlay.id,
            filters: overlay.dataFilters || {},
        }
    }

    return null
}

export default connect(mapStateToProps, { setDataFilter, clearDataFilter })(
    FilterInput
)
