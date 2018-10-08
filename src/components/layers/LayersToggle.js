import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import { openLayersPanel, closeLayersPanel } from '../../actions/ui';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH } from '../../constants/layout';

const styles = theme => ({
    button: {
        position: 'absolute',
        top: HEADER_HEIGHT + 15,
        left: LAYERS_PANEL_WIDTH,
        width: 24,
        height: 40,
        padding: 0,
        background: theme.palette.background.paper,
        borderRadius: 0,
        boxShadow: '3px 1px 5px -1px rgba(0, 0, 0, 0.2)',
        zIndex: 1100,
    }
});

// This expand/collapse toggle is separate from LayersPanel to avoid overflow issue
const LayersToggle = ({ isOpen, openLayersPanel, closeLayersPanel, classes }) => (
    <IconButton
        onClick={isOpen ? closeLayersPanel : openLayersPanel}
        className={classes.button}
        disableTouchRipple={true}
        style={isOpen ? {} : { left: 0 }}
    >
        {isOpen ? <LeftIcon /> : <RightIcon /> }
    </IconButton>
);

LayersToggle.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    openLayersPanel: PropTypes.func.isRequired,
    closeLayersPanel: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.layersPanelOpen,
    }),
    { openLayersPanel, closeLayersPanel }
)(withStyles(styles)(LayersToggle));
