import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import Interpretations from '@dhis2/d2-ui-interpretations';
import {
    HEADER_HEIGHT,
    INTERPRETATIONS_PANEL_WIDTH,
} from '../../constants/layout';

const style = {
    position: 'absolute',
    top: HEADER_HEIGHT,
    bottom: 0,
    height: 'auto',
    backgroundColor: '#fafafa',
    boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.227451)',
    // overflowX: 'hidden',
    // overflowY: 'auto',
    zIndex: 1190,
};

export const InterpretationsPanel = ({ isOpen, id }, { d2 }) => {
    return (
        <Drawer
            open={Boolean(isOpen && id)}
            openSecondary={true}
            containerStyle={style}
            width={INTERPRETATIONS_PANEL_WIDTH}
        >
            {id && <Interpretations d2={d2} id={id} type="map" />}
        </Drawer>
    );
};

InterpretationsPanel.contextTypes = {
    d2: PropTypes.object,
};

export default connect(state => ({
    isOpen: state.ui.interpretationsPanelOpen,
    id: state.map ? state.map.id : null,
}))(InterpretationsPanel);
