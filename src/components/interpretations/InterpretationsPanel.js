import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InterpretationsComponent from '@dhis2/d2-ui-interpretations';
import Drawer from '../core/Drawer';
import { openInterpretationsPanel } from '../../actions/ui';
import { setRelativePeriodDate } from '../../actions/map';
import { setInterpretation } from '../../actions/interpretations';
import { getUrlParameter } from '../../util/requests';

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
    };

    componentDidMount() {
        const interpretationId = getUrlParameter('interpretationid');

        if (interpretationId) {
            this.props.setInterpretation(interpretationId);
            this.props.openInterpretationsPanel();
        }
    }

    render() {
        const { mapId, isOpen, interpretationId } = this.props;

        if (!mapId || !isOpen) {
            return null;
        }

        return (
            Boolean(isOpen && mapId) && (
                <Drawer>
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
            )
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
        isOpen: state.ui.rightPanelOpen && !state.orgUnit,
        mapId: state.map.id,
        interpretationId: state.interpretation.id,
    }),
    { openInterpretationsPanel, setInterpretation, setRelativePeriodDate }
)(InterpretationsPanel);
