import i18n from '@dhis2/d2-i18n'
import { IconTable24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import { EARTH_ENGINE_LAYER } from '../../../constants/layers.js'
import { IconButton } from '../../core/index.js'

const DataTableToggleButton = ({ layer, toggleDataTable, hasError }) => {
    const isActive = useSelector((state) => state.dataTable === layer.id)

    const isEarthEngine = layer.layer === EARTH_ENGINE_LAYER
    const hasOrgUnitData =
        layer.data && (!isEarthEngine || layer.aggregationType?.length > 0)

    // Always allow closing the table, even if the layer lost its data
    const disabled = hasError || (!hasOrgUnitData && !isActive)
    const label = isActive
        ? i18n.t('Hide data table')
        : i18n.t('Show data table')

    return (
        <IconButton
            tooltip={label}
            ariaLabel={label}
            onClick={toggleDataTable}
            disabled={disabled}
            active={isActive}
            dataTest="layer-data-table-button"
        >
            <IconTable24 />
        </IconButton>
    )
}

DataTableToggleButton.propTypes = {
    layer: PropTypes.object.isRequired,
    toggleDataTable: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
}

export default DataTableToggleButton
