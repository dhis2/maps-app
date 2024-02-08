import { IconCross16 } from '@dhis2/ui'
import React, { useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataTable, resizeDataTable } from '../../actions/dataTable.js'
import {
    HEADER_HEIGHT,
    APP_MENU_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import DataTable from '../datatable/DataTable.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.js'
import ResizeHandle from './ResizeHandle.js'
import styles from './styles/BottomPanel.module.css'

// Container for DataTable
const BottomPanel = () => {
    const dataTableHeight = useSelector((state) => state.ui.dataTableHeight)
    const layersPanelOpen = useSelector((state) => state.ui.layersPanelOpen)
    const rightPanelOpen = useSelector((state) => state.ui.rightPanelOpen)

    const dispatch = useDispatch()
    const { width, height } = useWindowDimensions()
    const panelRef = useRef(null)

    const onResize = useCallback(
        (h) => (panelRef.current.style.height = `${h}px`),
        [panelRef]
    )

    const maxHeight = height - HEADER_HEIGHT - APP_MENU_HEIGHT
    const tableHeight =
        dataTableHeight < maxHeight ? dataTableHeight : maxHeight
    const layersWidth = layersPanelOpen ? LAYERS_PANEL_WIDTH : 0
    const rightPanelWidth = rightPanelOpen ? RIGHT_PANEL_WIDTH : 0
    const tableWidth = width - layersWidth - rightPanelWidth

    return (
        <div
            ref={panelRef}
            className={styles.bottomPanel}
            style={{ height: tableHeight, width: tableWidth }}
            data-test="bottom-panel"
        >
            <button
                className={styles.closeIcon}
                onClick={() => dispatch(closeDataTable())}
            >
                <IconCross16 />
            </button>
            <ResizeHandle
                maxHeight={maxHeight}
                onResize={onResize}
                onResizeEnd={(height) => dispatch(resizeDataTable(height))}
            />
            <DataTable
                availableHeight={dataTableHeight}
                availableWidth={tableWidth}
            />
        </div>
    )
}

export default BottomPanel
