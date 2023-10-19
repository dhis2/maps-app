import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'
import styles from './styles/FilterInput.module.css'

// http://adazzle.github.io/react-data-grid/examples.html#/custom-filters
// https://github.com/adazzle/react-data-grid/tree/master/packages/react-data-grid-addons/src/cells/headerCells/filters
const FilterInput = ({ type, dataKey }) => {
    const dispatch = useDispatch()
    const dataTable = useSelector((state) => state.dataTable)
    const map = useSelector((state) => state.map)

    const overlay =
        dataTable && map.mapViews.filter((layer) => layer.id === dataTable)[0]

    let layerId
    let filters
    if (overlay) {
        layerId = overlay.id
        filters = overlay.dataFilters || {}
    }

    const filterValue = filters[dataKey] || ''

    // https://stackoverflow.com/questions/36683770/react-how-to-get-the-value-of-an-input-field
    const onChange = (evt) => {
        const value = evt.target.value

        if (value !== '') {
            dispatch(setDataFilter(layerId, dataKey, value))
        } else {
            dispatch(clearDataFilter(layerId, dataKey, value))
        }
    }

    // TODO: Support more field types
    return (
        <input
            className={styles.filterInput}
            placeholder={type === 'number' ? '2,>3&<8' : i18n.t('Search')}
            value={filterValue}
            onClick={(evt) => evt.stopPropagation()}
            onChange={onChange}
        />
    )
}

FilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
}

export default FilterInput
