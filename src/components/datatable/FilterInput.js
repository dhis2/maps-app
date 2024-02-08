import i18n from '@dhis2/d2-i18n'
import { Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDataFilter, clearDataFilter } from '../../actions/dataFilters.js'

const FilterInput = ({ type, dataKey, name }) => {
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

    const onChange = ({ value }) =>
        value !== ''
            ? dispatch(setDataFilter(layerId, dataKey, value))
            : dispatch(clearDataFilter(layerId, dataKey, value))

    return (
        <Input
            dataTest={`data-table-column-filter-input-${name}`}
            dense
            placeholder={type === 'number' ? '2,>3&<8' : i18n.t('Search')}
            value={filterValue}
            onChange={onChange}
        />
    )
}

FilterInput.propTypes = {
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
}

export default FilterInput
