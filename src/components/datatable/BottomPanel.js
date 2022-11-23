import { IconCross16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { closeDataTable, resizeDataTable } from '../../actions/dataTable.js'
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import DataTable from '../datatable/DataTable.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.js'
import ResizeHandle from './ResizeHandle.js'
import styles from './styles/BottomPanel.module.css'

// Container for DataTable
const BottomPanel = ({
    layersPanelOpen,
    rightPanelOpen,
    dataTableOpen,
    dataTableHeight,
    resizeDataTable,
    closeDataTable,
}) => {
    const { width, height } = useWindowDimensions()
    const node = useRef(null)

    const onResize = (h) => (node.current.style.height = `${h}px`)

    if (dataTableOpen) {
        const maxHeight = height - HEADER_HEIGHT - 20
        const tableHeight =
            dataTableHeight < maxHeight ? dataTableHeight : maxHeight
        const layersWidth = layersPanelOpen ? LAYERS_PANEL_WIDTH : 0
        const rightPanelWidth = rightPanelOpen ? RIGHT_PANEL_WIDTH : 0
        const tableWidth = width - layersWidth - rightPanelWidth

        const style = {
            height: tableHeight,
            left: layersWidth,
            right: rightPanelWidth,
        }

        return (
            <div ref={node} className={styles.bottomPanel} style={style}>
                <span className={styles.closeIcon} onClick={closeDataTable}>
                    <IconCross16 />
                </span>
                <ResizeHandle
                    maxHeight={maxHeight}
                    onResize={(h) => onResize(h)}
                    onResizeEnd={(h) => resizeDataTable(h)}
                />
                <DataTable width={tableWidth} height={tableHeight} />
            </div>
        )
    }

    return null
}

BottomPanel.propTypes = {
    closeDataTable: PropTypes.func.isRequired,
    dataTableHeight: PropTypes.number.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    layersPanelOpen: PropTypes.bool.isRequired,
    resizeDataTable: PropTypes.func.isRequired,
    rightPanelOpen: PropTypes.bool.isRequired,
}

export default connect(
    ({ dataTable, ui }) => ({
        dataTableOpen: !!dataTable,
        dataTableHeight: ui.dataTableHeight,
        layersPanelOpen: ui.layersPanelOpen,
        rightPanelOpen: ui.rightPanelOpen,
    }),
    { closeDataTable, resizeDataTable }
)(BottomPanel)