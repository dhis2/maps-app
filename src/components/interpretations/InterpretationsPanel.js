import React, { useState, useRef, useEffect } from 'react';
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
import { openInterpretationsPanel } from '../../actions/ui';
import { getUrlParameter } from '../../util/requests';

const InterpretationsPanel = ({ map, isOpen, openInterpretationsPanel }) => {
    const [interpretationId, setInterpretationId] = useState();
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [initialFocus, setInitialFocus] = useState(false);
    const interpretationsUnitRef = useRef();
    const { d2 } = useD2();

    const onInterpretationUpdate = () =>
        interpretationsUnitRef.current.refresh();

    useEffect(() => {
        const urlInterpretationId = getUrlParameter('interpretationid');

        if (urlInterpretationId) {
            setInterpretationId(urlInterpretationId);
            openInterpretationsPanel();
        }
    }, []);

    if (!map.id) {
        return null;
    }

    return (
        <>
            {isOpen && (
                <Drawer>
                    <AboutAOUnit type="maps" id={map.id} />
                    <InterpretationsUnit
                        ref={interpretationsUnitRef}
                        type="map"
                        id={map.id}
                        currentUser={d2.currentUser}
                        onInterpretationClick={setInterpretationId}
                        onReplyIconClick={interpretationId => {
                            setInterpretationId(interpretationId);
                            setInitialFocus(true);
                        }}
                        disabled={false} // TODO
                    />
                </Drawer>
            )}
            {interpretationId && (
                <InterpretationModal
                    currentUser={d2.currentUser}
                    onInterpretationUpdate={onInterpretationUpdate}
                    initialFocus={initialFocus}
                    interpretationId={interpretationId}
                    isVisualizationLoading={isMapLoading}
                    onClose={() => {
                        setInterpretationId();
                        setInitialFocus(false);
                    }}
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
    isOpen: PropTypes.bool,
    map: PropTypes.object.isRequired,
    interpretationId: PropTypes.string,
    openInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        map: state.map,
    }),
    { openInterpretationsPanel }
)(InterpretationsPanel);
