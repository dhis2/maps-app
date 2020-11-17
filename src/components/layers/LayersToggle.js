import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import { openLayersPanel, closeLayersPanel } from '../../actions/ui';
import styles from './styles/LayersToggle.module.css';

// This expand/collapse toggle is separate from LayersPanel to avoid overflow issue
const LayersToggle = ({
    isOpen,
    isDownload,
    openLayersPanel,
    closeLayersPanel,
}) =>
    !isDownload && (
        <div
            onClick={isOpen ? closeLayersPanel : openLayersPanel}
            className={styles.layersToggle}
            style={isOpen ? {} : { left: 0 }}
        >
            {isOpen ? <LeftIcon /> : <RightIcon />}
        </div>
    );

LayersToggle.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    isDownload: PropTypes.bool.isRequired,
    openLayersPanel: PropTypes.func.isRequired,
    closeLayersPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.layersPanelOpen,
        isDownload: state.download.showDialog,
    }),
    { openLayersPanel, closeLayersPanel }
)(LayersToggle);
