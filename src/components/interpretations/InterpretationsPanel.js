import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InterpretationsComponent from '@dhis2/d2-ui-interpretations';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import Drawer from '../core/Drawer';
import { openInterpretationsPanel } from '../../actions/ui';
import { setRelativePeriodDate } from '../../actions/map';
import { setInterpretation } from '../../actions/interpretations';
import { getUrlParameter } from '../../util/requests';

const InterpretationsPanel = ({
    mapId,
    isOpen,
    interpretationId,
    setInterpretation,
    openInterpretationsPanel,
    setRelativePeriodDate,
}) => {
    const { d2 } = useD2();

    useEffect(() => {
        const interpretationId = getUrlParameter('interpretationid');

        if (interpretationId) {
            setInterpretation(interpretationId);
            openInterpretationsPanel();
        }
    }, []);

    const onCurrentInterpretationChange = interpretation => {
        setInterpretation(interpretation ? interpretation.id : null);
        setRelativePeriodDate(interpretation ? interpretation.created : null);
    };

    if (!mapId || !isOpen) {
        return null;
    }

    return (
        Boolean(isOpen && mapId) && (
            <Drawer>
                <InterpretationsComponent
                    d2={d2}
                    id={mapId}
                    type="map"
                    currentInterpretationId={interpretationId}
                    onCurrentInterpretationChange={
                        onCurrentInterpretationChange
                    }
                />
            </Drawer>
        )
    );
};

InterpretationsPanel.propTypes = {
    isOpen: PropTypes.bool,
    mapId: PropTypes.string,
    interpretationId: PropTypes.string,
    setInterpretation: PropTypes.func.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
    setRelativePeriodDate: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        mapId: state.map.id,
        interpretationId: state.interpretation.id,
    }),
    { openInterpretationsPanel, setInterpretation, setRelativePeriodDate }
)(InterpretationsPanel);
