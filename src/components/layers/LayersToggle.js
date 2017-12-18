import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey800 } from 'material-ui/styles/colors';
import { openLayersPanel, closeLayersPanel } from '../../actions/ui';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH } from '../../constants/layout';

const style = {
    position: 'absolute',
    top: HEADER_HEIGHT + 15,
    left: LAYERS_PANEL_WIDTH,
    width: 24,
    height: 40,
    padding: 0,
    background: '#fff',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    boxShadow: '3px 1px 5px -1px rgba(0, 0, 0, 0.2)',
    zIndex: 1100,
};

// Thiss expand/collapse toggle is separate from LayersPanel to avoid overflow issue
const LayersToggle = ({ isOpen, openLayersPanel, closeLayersPanel }) => (isOpen ?
    <IconButton onClick={closeLayersPanel} style={style} disableTouchRipple={true}>
        <SvgIcon icon="ChevronLeft" color={grey800} />
    </IconButton>
:
    <IconButton onClick={openLayersPanel} style={{...style, left: 0}} disableTouchRipple={true}>
        <SvgIcon icon="ChevronRight" color={grey800} />
    </IconButton>
);

LayersToggle.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    openLayersPanel: PropTypes.func.isRequired,
    closeLayersPanel: PropTypes.func.isRequired,
};

export default connect(
    (state) => ({
        isOpen: state.ui.layersPanelOpen,
    }),
    { openLayersPanel, closeLayersPanel, }
)(LayersToggle);
