import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { MenuButton } from '../core';
import { IconChevronLeft24, IconChevronRight24 } from '@dhis2/ui';
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui';
import styles from './styles/InterpretationsToggle.module.css';

export const InterpretationsToggle = ({
    interpretationsOpen,
    interpretationsEnabled,
    openInterpretationsPanel,
    closeInterpretationsPanel,
}) => (
    <div className={styles.button}>
        <MenuButton
            onClick={
                interpretationsOpen
                    ? closeInterpretationsPanel
                    : openInterpretationsPanel
            }
            disabled={!interpretationsEnabled}
        >
            {interpretationsOpen ? (
                <IconChevronRight24 />
            ) : (
                <IconChevronLeft24 />
            )}
            {i18n.t('Interpretations')}
        </MenuButton>
    </div>
);

InterpretationsToggle.propTypes = {
    interpretationsOpen: PropTypes.bool.isRequired,
    interpretationsEnabled: PropTypes.bool.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
    closeInterpretationsPanel: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        interpretationsOpen:
            state.ui.rightPanelOpen &&
            !state.orgUnitProfile &&
            !state.featureProfile,
        interpretationsEnabled: Boolean(state.map.id),
    }),
    {
        openInterpretationsPanel,
        closeInterpretationsPanel,
    }
)(InterpretationsToggle);
