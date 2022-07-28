import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { InterpretationModal as AnalyticsInterpretationModal } from '@dhis2/analytics';

// https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/components/InterpretationModal/InterpretationModal.js
const InterpretationModal = ({ interpretationId }) => {
    // console.log('InterpretationsModal', interpretationId);

    if (!interpretationId) {
        return null;
    }

    return <div>Modal</div>;
};

InterpretationModal.propTypes = {
    interpretationId: PropTypes.string,
};

export default connect(
    state => ({
        interpretationId: state.interpretation.id,
    }),
    {}
)(InterpretationModal);
