import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Drawer } from '@material-ui/core';
import InterpretationsComponent from '@dhis2/d2-ui-interpretations';
import { openInterpretationsPanel } from '../../actions/ui';
import { setRelativePeriodDate } from '../../actions/map';
import { setInterpretation } from '../../actions/interpretations';
import { getUrlParameter } from '../../util/requests';
import {
    HEADER_HEIGHT,
    INTERPRETATIONS_PANEL_WIDTH,
} from '../../constants/layout';

const styles = theme => ({
    panel: {
        position: 'absolute',
        top: HEADER_HEIGHT,
        height: 'auto',
        bottom: 0,
        width: INTERPRETATIONS_PANEL_WIDTH,
        backgroundColor: theme.palette.background.default,
        boxShadow: '0 3px 10px 0 rgba(0, 0, 0, 0.227451)',
        overflowX: 'hidden',
        overflowY: 'auto',
        zIndex: 1190,
    },
});

// https://github.com/EyeSeeTea/d2-ui-playground/blob/feature/interpretations/src/Root.js
// http://localhost:8082/?id=zDP78aJU8nX&interpretationid=zS8iVkpyCVb
class InterpretationsPanel extends Component {
    static contextTypes = {
        d2: PropTypes.object,
    };

    static propTypes = {
        isOpen: PropTypes.bool,
        mapId: PropTypes.string,
        interpretationId: PropTypes.string,
        setInterpretation: PropTypes.func.isRequired,
        openInterpretationsPanel: PropTypes.func.isRequired,
        setRelativePeriodDate: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    componentDidMount() {
        const interpretationId = getUrlParameter('interpretationid');

        if (interpretationId) {
            this.props.setInterpretation(interpretationId);
            this.props.openInterpretationsPanel();
        }
    }

    render() {
        const { mapId, isOpen, interpretationId, classes } = this.props;

        if (!mapId || !isOpen) {
            return null;
        }

        return (
            <Drawer
                open={Boolean(isOpen && mapId)}
                variant="persistent"
                anchor="right"
                classes={{ paper: classes.panel }}
            >
                <InterpretationsComponent
                    d2={this.context.d2}
                    id={mapId}
                    type="map"
                    currentInterpretationId={interpretationId}
                    onCurrentInterpretationChange={
                        this.onCurrentInterpretationChange
                    }
                />
            </Drawer>
        );
    }

    onCurrentInterpretationChange = interpretation => {
        const { setInterpretation, setRelativePeriodDate } = this.props;
        setInterpretation(interpretation ? interpretation.id : null);
        setRelativePeriodDate(interpretation ? interpretation.created : null);
    };
}

export default connect(
    state => ({
        isOpen: state.ui.interpretationsPanelOpen,
        mapId: state.map.id,
        interpretationId: state.interpretation.id,
    }),
    { openInterpretationsPanel, setInterpretation, setRelativePeriodDate }
)(withStyles(styles)(InterpretationsPanel));
