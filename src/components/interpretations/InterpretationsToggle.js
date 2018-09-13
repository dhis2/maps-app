import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import {
    openInterpretationsPanel,
    closeInterpretationsPanel,
} from '../../actions/ui';

const styles = {
    button: {
        position: 'absolute',
        right: 0,
    }, 
    label: {
        textTransform: 'none',
        fontSize: 16,
        fontWeight: 400,
    },
    icon: {
        marginRight: 8,
        marginTop: 2,
    }
};

export const InterpretationsToggle = ({
    interpretationsOpen,
    interpretationsEnabled,
    openInterpretationsPanel,
    closeInterpretationsPanel,
    classes,
}) => (
    <Button
        onClick={
            interpretationsOpen
                ? closeInterpretationsPanel
                : openInterpretationsPanel
        }
        disabled={!interpretationsEnabled}
        classes={{
            root: classes.button,
            label: classes.label
        }}
    >{interpretationsOpen ? 
        <RightIcon className={classes.icon} /> : 
        <LeftIcon className={classes.icon} />
    }{i18n.t('Interpretations')}</Button>
);

InterpretationsToggle.propTypes = {
    interpretationsOpen: PropTypes.bool.isRequired,
    interpretationsEnabled: PropTypes.bool.isRequired,
    openInterpretationsPanel: PropTypes.func.isRequired,
    closeInterpretationsPanel: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
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
)(withStyles(styles)(InterpretationsToggle));
