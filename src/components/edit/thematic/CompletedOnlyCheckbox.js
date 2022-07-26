import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { Checkbox } from '../../core';
import { setCompletedOnly } from '../../../actions/layerEdit';

export const CompletedOnlyCheckbox = ({ completedOnly, setCompletedOnly }) => {
    return (
        <Checkbox
            label={i18n.t('Only show completed events')}
            checked={completedOnly}
            onChange={setCompletedOnly}
        />
    );
};

CompletedOnlyCheckbox.propTypes = {
    completedOnly: PropTypes.bool,
    setCompletedOnly: PropTypes.func.isRequired,
};

export default connect(
    ({ layerEdit }) => ({
        completedOnly: layerEdit.completedOnly,
    }),
    { setCompletedOnly }
)(CompletedOnlyCheckbox);
