import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Drawer from 'material-ui/Drawer';
import Interpretations from '@dhis2/d2-ui-interpretations';
import { setRelativePeriodDate } from '../../actions/map';
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

// https://github.com/EyeSeeTea/d2-ui-playground/blob/feature/interpretations/src/Root.js
// http://localhost:8082/?id=zDP78aJU8nX&interpretationid=u2ugGSBGTbE
export const InterpretationsPanel = (
    { isOpen, mapId, interpretationId, setRelativePeriodDate },
    { d2 }
) => {
    return (
        <Drawer
            open={Boolean(isOpen && mapId)}
            openSecondary={true}
            containerStyle={style}
            width={INTERPRETATIONS_PANEL_WIDTH}
        >
            {mapId && (
                <Interpretations
                    d2={d2}
                    id={mapId}
                    type="map"
                    currentInterpretationId={interpretationId}
                    onCurrentInterpretationChange={
                        interpretation =>
                            setRelativePeriodDate(interpretation.created) // &relativePeriodDate=2018-10-10T18:20:04.272
                    }
                />
            )}
        </Drawer>
    );
};

InterpretationsPanel.contextTypes = {
    d2: PropTypes.object,
};

export default connect(
    state => ({
        isOpen: state.ui.interpretationsPanelOpen,
        mapId: state.map.id,
        interpretationId: state.interpretation.id,
    }),
    { setRelativePeriodDate }
)(InterpretationsPanel);
