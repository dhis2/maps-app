import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconCross16 } from '@dhis2/ui';
import ResizeHandle from './ResizeHandle';
import DataTable from '../datatable/DataTable';
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout';
import { closeDataTable, resizeDataTable } from '../../actions/dataTable';
import styles from './styles/BottomPanel.module.css';

// Container for DataTable
class BottomPanel extends Component {
    render() {
        const {
            layersPanelOpen,
            rightPanelOpen,
            dataTableOpen,
            dataTableHeight,
            width,
            height,
            resizeDataTable,
            closeDataTable,
        } = this.props;

        if (dataTableOpen) {
            const maxHeight = height - HEADER_HEIGHT - 20;
            const tableHeight =
                dataTableHeight < maxHeight ? dataTableHeight : maxHeight;
            const layersWidth = layersPanelOpen ? LAYERS_PANEL_WIDTH : 0;
            const rightPanelWidth = rightPanelOpen ? RIGHT_PANEL_WIDTH : 0;
            const tableWidth = width - layersWidth - rightPanelWidth;

            const style = {
                height: tableHeight,
                left: layersWidth,
                right: rightPanelWidth,
            };

            return (
                <div
                    ref={node => (this.node = node)}
                    className={styles.bottomPanel}
                    style={style}
                >
                    <span className={styles.closeIcon} onClick={closeDataTable}>
                        <IconCross16 />
                    </span>
                    <ResizeHandle
                        maxHeight={maxHeight}
                        onResize={height => this.onResize(height)}
                        onResizeEnd={height => resizeDataTable(height)}
                    />
                    <DataTable width={tableWidth} height={tableHeight} />
                </div>
            );
        }

        return null;
    }

    // Called from resize handle
    onResize(height) {
        this.node.style.height = `${height}px`;
    }
}

BottomPanel.propTypes = {
    layersPanelOpen: PropTypes.bool.isRequired,
    rightPanelOpen: PropTypes.bool.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    dataTableHeight: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    resizeDataTable: PropTypes.func.isRequired,
    closeDataTable: PropTypes.func.isRequired,
};

export default connect(
    ({ dataTable, ui }) => ({
        dataTableOpen: !!dataTable,
        dataTableHeight: ui.dataTableHeight,
        layersPanelOpen: ui.layersPanelOpen,
        rightPanelOpen: ui.rightPanelOpen,
        width: ui.width,
        height: ui.height,
    }),
    { closeDataTable, resizeDataTable }
)(BottomPanel);
