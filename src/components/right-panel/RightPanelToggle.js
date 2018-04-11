import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import SvgIcon from 'd2-ui/lib/svg-icon/SvgIcon';
import { grey800 } from 'material-ui/styles/colors';
import { openRightPanel, closeRightPanel } from '../../actions/ui';
import { HEADER_HEIGHT, RIGHT_PANEL_WIDTH } from '../../constants/layout';

const style = {
    position: 'absolute',
    top: HEADER_HEIGHT + 15,
    right: RIGHT_PANEL_WIDTH,
    width: 24,
    height: 40,
    padding: 0,
    background: '#fff',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow: '3px 1px 5px -1px rgba(0, 0, 0, 0.2)',
    zIndex: 1100,
};

const RightPanelToggle = ({ isOpen, openRightPanel, closeRightPanel }) => (
    isOpen
        ?
            <IconButton
                onClick={closeRightPanel}
                style={style}
                disableTouchRipple={true}
            >
                <SvgIcon icon="ChevronRight" color={grey800} />
            </IconButton>
        :
            <IconButton
                onClick={openRightPanel}
                style={{ ...style, right: 0 }}
                disableTouchRipple={true}
            >
                <SvgIcon icon="ChevronLeft" color={grey800} />
            </IconButton>
);

RightPanelToggle.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    openRightPanel: PropTypes.func.isRequired,
    closeRightPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.rightPanelOpen,
    }),
    { openRightPanel, closeRightPanel }
)(RightPanelToggle);
