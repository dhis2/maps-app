import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import { InterpretationModal as AnalyticsInterpretationModal } from '@dhis2/analytics';
import InterpretationMap from './InterpretationMap';
import InterpretationDownload from './InterpretationDownload';

// https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/components/InterpretationModal/InterpretationModal.js
const InterpretationModal = ({ map, interpretationId }) => {
    const { d2 } = useD2();

    // console.log('InterpretationsModal', interpretationId, map);

    if (!interpretationId) {
        return null;
    }

    return (
        <AnalyticsInterpretationModal
            currentUser={d2.currentUser}
            onInterpretationUpdate={() => {}}
            initialFocus={true}
            interpretationId={interpretationId}
            isVisualizationLoading={false}
            onClose={() => {}}
            onResponsesReceived={() => {}}
            visualization={map}
            downloadMenuComponent={InterpretationDownload}
            pluginComponent={InterpretationMap}
        />
    );
};

InterpretationModal.propTypes = {
    interpretationId: PropTypes.string,
    map: PropTypes.object,
};

export default connect(
    state => ({
        interpretationId: state.interpretation.id,
        map: state.map,
    }),
    {}
)(InterpretationModal);
