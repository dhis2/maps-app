import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/DataDownloadDialogActions.module.css'

const DataDownloadDialogActions = ({
    downloading,
    onStartClick,
    onCancelClick,
}) => (
    <ButtonStrip end>
        <Button secondary onClick={onCancelClick} disabled={downloading}>
            {i18n.t('Cancel')}
        </Button>
        <Button
            name="download-button"
            primary
            onClick={onStartClick}
            disabled={downloading}
        >
            {i18n.t('Download')}
            {downloading && (
                <CircularLoader small className={styles.btnProgress} />
            )}
        </Button>
    </ButtonStrip>
)

DataDownloadDialogActions.propTypes = {
    downloading: PropTypes.bool.isRequired,
    onCancelClick: PropTypes.func.isRequired,
    onStartClick: PropTypes.func.isRequired,
}

export default DataDownloadDialogActions
