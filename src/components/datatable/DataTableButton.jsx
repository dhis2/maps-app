import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    closeDataTable,
    toggleDataTable,
    toggleCombinedView,
} from '../../actions/dataTable.js'
import { getOrgUnitsFromRows } from '../../util/analytics.js'
import {
    getEligibleDataTableLayers,
    isDataTableOpen,
} from '../../util/dataTable.js'
import { useReferenceLayer } from './controls/ReferenceOrgUnitControl.jsx'
import styles from './styles/DataTableButton.module.css'

const DataTableButton = () => {
    const dispatch = useDispatch()
    const dataTable = useSelector((state) => state.dataTable)
    const mapViews = useSelector((state) => state.map.mapViews)
    const eligibleLayers = getEligibleDataTableLayers(mapViews)
    const { referenceLayer } = useReferenceLayer()
    const combinedEnabled =
        !!referenceLayer && getOrgUnitsFromRows(referenceLayer.rows).length > 0

    const onClick = () => {
        // Toggles the panel: closes it if a table is already showing
        // (single-layer or Combined), otherwise opens one. Combined is only
        // auto-opened here when a reference org unit set has already been
        // configured (mirrors BottomPanel.jsx's own combinedEnabled gate) -
        // otherwise there'd be nothing to show, so this shortcut falls back
        // to just opening the first eligible layer's own table instead.
        if (isDataTableOpen(dataTable)) {
            dispatch(closeDataTable())
            return
        }
        if (combinedEnabled) {
            dispatch(toggleCombinedView())
        } else if (eligibleLayers.length >= 1) {
            dispatch(toggleDataTable(eligibleLayers[0].id))
        }
    }

    return (
        <button
            type="button"
            className={styles.button}
            disabled={eligibleLayers.length === 0}
            onClick={onClick}
        >
            {i18n.t('Data table')}
        </button>
    )
}

export default DataTableButton
