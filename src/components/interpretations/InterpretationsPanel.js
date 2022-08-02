import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AboutAOUnit, InterpretationsUnit } from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import Drawer from '../core/Drawer';
import InterpretationModal from './InterpretationModal';
import { openInterpretationsPanel } from '../../actions/ui';
import { getUrlParameter } from '../../util/requests';
import styles from './styles/InterpretationsPanel.module.css';

const InterpretationsPanel = ({ mapId, isOpen, openInterpretationsPanel }) => {
    const [interpretationId, setInterpretationId] = useState();
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

    return (
        <>
            {Boolean(isOpen && mapId) && (
                <Drawer className={styles.drawer}>
                    <AboutAOUnit type="maps" id={mapId} />
                    <InterpretationsUnit
                        ref={interpretationsUnitRef}
                        type="map"
                        id={mapId}
                        currentUser={d2.currentUser}
                        onInterpretationClick={setInterpretationId}
                        onReplyIconClick={setInterpretationId}
                        disabled={false}
                    />
                </Drawer>
            )}
            <InterpretationModal
                interpretationId={interpretationId}
                onInterpretationUpdate={onInterpretationUpdate}
                onClose={() => setInterpretationId()}
            />
        </>
    );
};

InterpretationsPanel.propTypes = {
    isOpen: PropTypes.bool,
    mapId: PropTypes.string,
    interpretationId: PropTypes.string,
    openInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        mapId: state.map.id,
    }),
    { openInterpretationsPanel }
)(InterpretationsPanel);
