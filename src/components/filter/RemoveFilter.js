import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Tooltip } from '@material-ui/core';

const styles = theme => ({
    removeBtnContainer: {
        borderLeft: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        padding: '10px 0px',
        '&:hover': {
            backgroundColor: theme.palette.primary.lightest,
        },
    },
    removeBtn: {
        color: theme.palette.status.negative,
        '&:hover': {
            backgroundColor: 'inherit',
        },
    },
});

// Remove filter button used for both thematic and event filters
const RemoveFilter = ({ onClick, classes }) => (
    <Tooltip title={i18n.t('Remove filter')}>
        <div className={classes.removeBtnContainer} onClick={onClick}>
            <IconButton
                tooltip={i18n.t('Remove filter')}
                className={classes.removeBtn}
            >
                <DeleteIcon />
            </IconButton>
        </div>
    </Tooltip>
);

RemoveFilter.propTypes = {
    onClick: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RemoveFilter);
