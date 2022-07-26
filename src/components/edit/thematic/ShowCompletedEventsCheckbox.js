import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { Checkbox } from '../../core';
import { setShowCompletedEvents } from '../../../actions/layerEdit';

export const ShowCompletedEventsCheckbox = ({
    completedEvents,
    setShowCompletedEvents,
}) => {
    return (
        <Checkbox
            label={i18n.t('Only show completed events')}
            checked={completedEvents}
            onChange={setShowCompletedEvents}
        />
    );
};

ShowCompletedEventsCheckbox.propTypes = {
    completedEvents: PropTypes.bool,
    setShowCompletedEvents: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        completedEvents: layerEdit.completedEvents,
    }),
    { setShowCompletedEvents }
)(ShowCompletedEventsCheckbox);
