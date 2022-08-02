import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AboutAOUnit, InterpretationsUnit } from '@dhis2/analytics';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import Drawer from '../core/Drawer';
import InterpretationModal from './InterpretationModal';
import { openInterpretationsPanel } from '../../actions/ui';
import { setInterpretation } from '../../actions/interpretations';
import { getUrlParameter } from '../../util/requests';
import styles from './styles/InterpretationsPanel.module.css';

const InterpretationsPanel = ({
    mapId,
    isOpen,
    setInterpretation,
    openInterpretationsPanel,
}) => {
    const { d2 } = useD2();
    const interpretationsUnitRef = useRef();

    const onInterpretationUpdate = () =>
        interpretationsUnitRef.current.refresh();

    useEffect(() => {
        const interpretationId = getUrlParameter('interpretationid');

        if (interpretationId) {
            setInterpretation(interpretationId);
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
                        onInterpretationClick={setInterpretation}
                        onReplyIconClick={setInterpretation}
                        disabled={false}
                    />
                </Drawer>
            )}
            <InterpretationModal
                onInterpretationUpdate={onInterpretationUpdate}
            />
        </>
    );
};

InterpretationsPanel.propTypes = {
    isOpen: PropTypes.bool,
    mapId: PropTypes.string,
    interpretationId: PropTypes.string,
    setInterpretation: PropTypes.func.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.rightPanelOpen && !state.orgUnitProfile,
        mapId: state.map.id,
    }),
    { openInterpretationsPanel, setInterpretation }
)(InterpretationsPanel);
