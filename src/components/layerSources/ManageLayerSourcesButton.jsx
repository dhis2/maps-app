import i18n from '@dhis2/d2-i18n'
import { Button, IconSettings16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/ManageLayerSourcesButton.module.css'

// PROTOTYPE ONLY - the admin authority gate (MAPS_ADMIN_AUTHORITY_IDS via
// useCachedData) is bypassed so the dialog is reachable on any test login.
// Restore it before this becomes real.
const ManageLayerSourcesButton = ({ onClick }) => {
    return (
        <div className={styles.button}>
            <Button
                dataTest="managelayersources-button"
                small
                secondary
                icon={<IconSettings16 />}
                onClick={onClick}
            >
                {i18n.t('Manage')}
            </Button>
        </div>
    )
}

ManageLayerSourcesButton.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default ManageLayerSourcesButton
