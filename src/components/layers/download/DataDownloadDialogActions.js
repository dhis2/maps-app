import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import i18n from '@dhis2/d2-i18n';

const styles = {
    wrapper: {
        position: 'relative',
    },
    btnProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
};

export const DataDownloadDialogActions = ({
    classes,

    downloading,
    onStartClick,
    onCancelClick,
}) => (
    <Fragment>
        <Button
            variant="text"
            color="primary"
            onClick={onCancelClick}
            disabled={downloading}
        >
            {i18n.t('Cancel')}
        </Button>
        <div className={classes.wrapper}>
            <Button
                variant="contained"
                color="primary"
                onClick={onStartClick}
                disabled={downloading}
            >
                {i18n.t('Download')}
            </Button>
            {downloading && (
                <CircularProgress size={24} className={classes.btnProgress} />
            )}
        </div>
    </Fragment>
);

DataDownloadDialogActions.propTypes = {
    classes: PropTypes.object.isRequired,

    downloading: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onCancelClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(DataDownloadDialogActions);
