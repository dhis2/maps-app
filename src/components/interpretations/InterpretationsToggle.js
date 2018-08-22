import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import FlatButton from 'material-ui/FlatButton'; // TODO: Support buttons with uppercase in d2-ui
import LeftIcon from 'material-ui/svg-icons/navigation/chevron-left';
import RightIcon from 'material-ui/svg-icons/navigation/chevron-right';
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui';

const style = {
    textTransform: 'none',
    fontSize: 16,
    fontWeight: 400,
};

export const InterpretationsToggle = ({
    interpretationsOpen,
    interpretationsEnabled,
    openInterpretationsPanel,
    closeInterpretationsPanel,
}) => (
    <FlatButton
        label={i18n.t('Interpretations')}
        onClick={
            interpretationsOpen
                ? closeInterpretationsPanel
                : openInterpretationsPanel
        }
        disabled={!interpretationsEnabled}
        icon={interpretationsOpen ? <RightIcon /> : <LeftIcon />}
        labelStyle={style}
    />
);

InterpretationsToggle.propTypes = {
    interpretationsOpen: PropTypes.bool.isRequired,
    interpretationsEnabled: PropTypes.bool.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
    closeInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        interpretationsOpen: state.ui.interpretationsPanelOpen,
        interpretationsEnabled: Boolean(state.map.id),
    }),
    {
        openInterpretationsPanel,
        closeInterpretationsPanel,
    }
)(InterpretationsToggle);
