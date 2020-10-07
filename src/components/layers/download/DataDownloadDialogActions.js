import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, ButtonStrip, CircularLoader } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';

const styles = {
    btnProgress: {
        position: 'absolute',
        top: -10,
        left: 'calc(50% - 25px)',
    },
};

export const DataDownloadDialogActions = ({
    classes,
    downloading,
    onStartClick,
    onCancelClick,
}) => (
    <ButtonStrip end>
        <Button secondary onClick={onCancelClick} disabled={downloading}>
            {i18n.t('Cancel')}
        </Button>
        <Button primary onClick={onStartClick} disabled={downloading}>
            {i18n.t('Download')}
            {downloading && (
                <CircularLoader small className={classes.btnProgress} />
            )}
        </Button>
    </ButtonStrip>
);

DataDownloadDialogActions.propTypes = {
    classes: PropTypes.object.isRequired,

    downloading: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onCancelClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(DataDownloadDialogActions);
