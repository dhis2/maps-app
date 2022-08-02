import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useD2 } from '@dhis2/app-runtime-adapter-d2';
import { InterpretationModal as AnalyticsInterpretationModal } from '@dhis2/analytics';
import InterpretationMap from './InterpretationMap';
import InterpretationDownload from './InterpretationDownload';

// https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/components/InterpretationModal/InterpretationModal.js
const InterpretationModal = ({
    map,
    interpretationId,
    onInterpretationUpdate,
    onClose,
}) => {
    const [isMapLoading, setIsMapLoading] = useState(false);
    const { d2 } = useD2();

    return interpretationId ? (
        <AnalyticsInterpretationModal
            currentUser={d2.currentUser}
            onInterpretationUpdate={onInterpretationUpdate}
            initialFocus={true}
            interpretationId={interpretationId}
            isVisualizationLoading={isMapLoading}
            onClose={onClose}
            onResponsesReceived={() => setIsMapLoading(false)}
            visualization={map}
            downloadMenuComponent={InterpretationDownload}
            pluginComponent={InterpretationMap}
        />
    ) : null;
};

InterpretationModal.propTypes = {
    interpretationId: PropTypes.string,
    map: PropTypes.object,
    onInterpretationUpdate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default connect(({ map }) => ({ map }))(InterpretationModal);
