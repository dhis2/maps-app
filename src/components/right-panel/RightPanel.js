import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import DetailsCard from '../details/DetailsCard';
import InterpretationsCard from '../interpretations/InterpretationsCard';
import RightPanelToggle from './RightPanelToggle';
import { HEADER_HEIGHT, RIGHT_PANEL_WIDTH } from '../../constants/layout';

const style = {
    top: HEADER_HEIGHT,
    height: 'auto',
    bottom: 0,
    backgroundColor: '#fafafa',
    boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.227451)',
    overflowX: 'hidden',
    overflowY: 'auto',
    zIndex: 1190,
};

const RightPanel = ({
    visible,
    rightPanelOpen,
}) => (visible ?
        <div>
            <RightPanelToggle />
            <Drawer
                open={rightPanelOpen}
                openSecondary={true}
                containerStyle={style}
                width={RIGHT_PANEL_WIDTH}
            >
                <DetailsCard />
                <InterpretationsCard />
            </Drawer>
        </div> : null
);

RightPanel.propTypes = {
    visible: PropTypes.bool.isRequired,
    rightPanelOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    visible: !!state.map.id,
    rightPanelOpen: state.ui.rightPanelOpen,
});

export default connect(mapStateToProps, {})(RightPanel);
