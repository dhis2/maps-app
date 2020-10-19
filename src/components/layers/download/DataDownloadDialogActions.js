import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonStrip, CircularLoader } from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import styles from './styles/DataDownloadDialogActions.module.css';

export const DataDownloadDialogActions = ({
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
                <CircularLoader small className={styles.btnProgress} />
            )}
        </Button>
    </ButtonStrip>
);

DataDownloadDialogActions.propTypes = {
    downloading: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onCancelClick: PropTypes.func.isRequired,
};

export default DataDownloadDialogActions;
