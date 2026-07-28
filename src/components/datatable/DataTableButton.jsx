import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    toggleDataTable,
    toggleCombinedView,
    setJoinConfig,
} from '../../actions/dataTable.js'
import {
    getEligibleDataTableLayers,
    isDataTableOpen,
} from '../../util/dataTable.js'
import styles from './styles/DataTableButton.module.css'

const DataTableButton = () => {
    const dispatch = useDispatch()
    const dataTable = useSelector((state) => state.dataTable)
    const mapViews = useSelector((state) => state.map.mapViews)
    const eligibleLayers = getEligibleDataTableLayers(mapViews)

    const onClick = () => {
        // Only a quick-open shortcut for the closed state - if a table is
        // already showing (single-layer or Combined), this is a no-op; the
        // panel's own Close button is the only way to close it.
        if (isDataTableOpen(dataTable)) {
            return
        }
        if (eligibleLayers.length >= 2) {
            dispatch(
                setJoinConfig({
                    level: 'orgUnit',
                    layerIds: eligibleLayers.map((l) => l.id),
                    pointLayerId: null,
                    polygonLayerId: null,
                })
            )
            dispatch(toggleCombinedView())
        } else if (eligibleLayers.length === 1) {
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
