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
import { getUrlParameter } from '../../util/requests';
import { incrementInterpretationModalClosedCount } from '../../actions/ui';

const InterpretationsPanel = ({
    map,
    isPanelOpen,
    incrementInterpretationModalClosedCount,
}) => {
    const [interpretationId, setInterpretationId] = useState();
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [initialFocus, setInitialFocus] = useState(false);
    const interpretationsUnitRef = useRef();
    const { d2 } = useD2();

    useEffect(() => {
        const urlInterpretationId = getUrlParameter('interpretationid');

        if (urlInterpretationId) {
            setInterpretationId(urlInterpretationId);
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
                    onInterpretationUpdate={() =>
                        interpretationsUnitRef.current.refresh()
                    }
                    initialFocus={initialFocus}
                    interpretationId={interpretationId}
                    isVisualizationLoading={isMapLoading}
                    onClose={() => {
                        setInterpretationId();
                        setInitialFocus(false);

                        // TODO: Remove timeout if onClose is called after maps are not rendered
                        setTimeout(
                            () => incrementInterpretationModalClosedCount(),
                            100
                        );
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
    map: PropTypes.object.isRequired,
    isPanelOpen: PropTypes.bool,
    incrementInterpretationModalClosedCount: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        map: state.map,
        isPanelOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
    }),
    {
        incrementInterpretationModalClosedCount,
    }
)(InterpretationsPanel);
