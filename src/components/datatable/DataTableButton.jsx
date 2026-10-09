import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    closeDataTable,
    openDataTable,
    toggleDataTable,
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
        if (isDataTableOpen(dataTable)) {
            dispatch(closeDataTable())
            return
        }
        if (dataTable.openIds.length > 0) {
            dispatch(openDataTable())
            return
        }
        if (eligibleLayers.length >= 1) {
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
