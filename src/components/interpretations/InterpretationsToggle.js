import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import MenuButton from '../core/MenuButton';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
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
                <RightIcon className={styles.icon} />
            ) : (
                <LeftIcon className={styles.icon} />
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
        interpretationsOpen: state.ui.interpretationsPanelOpen,
        interpretationsEnabled: Boolean(state.map.id),
    }),
    {
        openInterpretationsPanel,
        closeInterpretationsPanel,
    }
)(InterpretationsToggle);
