import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { Checkbox } from '../../core';
import { setEventStatus } from '../../../actions/layerEdit';
import {
    EVENT_STATUS_ALL,
    EVENT_STATUS_COMPLETED,
} from '../../../constants/eventStatuses';

export const CompletedOnlyCheckbox = ({ completedOnly, setEventStatus }) => {
    return (
        <Checkbox
            label={i18n.t('Only show completed events')}
            checked={completedOnly}
            onChange={isChecked =>
                setEventStatus(
                    isChecked ? EVENT_STATUS_COMPLETED : EVENT_STATUS_ALL
                )
            }
        />
    );
};

CompletedOnlyCheckbox.propTypes = {
    completedOnly: PropTypes.bool,
    setEventStatus: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        completedOnly: layerEdit.eventStatus === EVENT_STATUS_COMPLETED,
    }),
    { setEventStatus }
)(CompletedOnlyCheckbox);
