import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    AboutAOUnit,
    InterpretationsUnit,
    InterpretationModal,
} from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import Drawer from '../core/Drawer';
import InterpretationMap from './InterpretationMap';
import InterpretationDownload from './InterpretationDownload';
import { getUrlParameter } from '../../util/requests';
import { setInterpretation } from '../../actions/interpretations';

const InterpretationsPanel = ({
    interpretationId,
    map,
    isPanelOpen,
    setInterpretation,
}) => {
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [initialFocus, setInitialFocus] = useState(false);
    const interpretationsUnitRef = useRef();
    const { d2 } = useD2();

    // TODO: Remove timeout if onClose is called after maps are not rendered
    const onModalClose = useCallback(() => {
        setTimeout(() => {
            setInitialFocus(false);
            setInterpretation();
        }, 100);
    }, []);

    const onReplyIconClick = useCallback(interpretationId => {
        setInterpretation(interpretationId);
        setInitialFocus(true);
    }, []);

    useEffect(() => {
        const urlInterpretationId = getUrlParameter('interpretationid');

        if (urlInterpretationId) {
            setInterpretation(urlInterpretationId);
        }
    }, []);

    if (!map?.id) {
        return null;
    }

    return (
        <>
            {isPanelOpen && (
                <Drawer>
                    <AboutAOUnit type="maps" id={map.id} />
                    <InterpretationsUnit
                        ref={interpretationsUnitRef}
                        type="map"
                        id={map.id}
                        currentUser={d2.currentUser}
                        onInterpretationClick={setInterpretation}
                        onReplyIconClick={onReplyIconClick}
                        disabled={false} // TODO
                    />
                </Drawer>
            )}
            {interpretationId && (
                <InterpretationModal
                    currentUser={d2.currentUser}
                    onInterpretationUpdate={() =>
                        interpretationsUnitRef.current.refresh()
                    }
                    initialFocus={initialFocus}
                    interpretationId={interpretationId}
                    isVisualizationLoading={isMapLoading}
                    onClose={onModalClose}
                    onResponsesReceived={() => setIsMapLoading(false)}
                    visualization={map}
                    downloadMenuComponent={InterpretationDownload}
                    pluginComponent={InterpretationMap}
                />
            )}
        </>
    );
};

InterpretationsPanel.propTypes = {
    interpretationId: PropTypes.string,
    map: PropTypes.object.isRequired,
    isPanelOpen: PropTypes.bool,
    setInterpretation: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        map: state.map,
        isPanelOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        interpretationId: state.interpretation,
    }),
    {
        setInterpretation,
    }
)(InterpretationsPanel);
