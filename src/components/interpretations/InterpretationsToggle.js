import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Button } from '@dhis2/d2-ui-core';
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui';

const InterpretationsToggle = ({
    isOpen,
    enabled,
    openInterpretationsPanel,
    closeInterpretationsPanel,
}) => (
    <Button
        raised={isOpen}
        onClick={() =>
            isOpen ? closeInterpretationsPanel() : openInterpretationsPanel()
        }
        disabled={!enabled}
    >
        {i18n.t('Interpretations')}
    </Button>
);

InterpretationsToggle.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
    closeInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        isOpen: state.ui.interpretationsPanelOpen,
        enabled: Boolean(state.map.id),
    }),
    { openInterpretationsPanel, closeInterpretationsPanel }
)(InterpretationsToggle);
