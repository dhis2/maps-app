import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { MAPS_ADMIN_AUTHORITY_ID } from '../../constants/settings.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/ManageLayerSourcesButton.module.css'

const ManageLayerSourcesButton = ({ onClick }) => {
    const { currentUser } = useCachedData()
    const isMapsAdmin = currentUser.authorities.has(MAPS_ADMIN_AUTHORITY_ID)

    if (!isMapsAdmin) {
        return null
    }

    return (
        <div className={styles.button}>
            <Button
                dataTest="managelayersources-button"
                small
                secondary
                onClick={onClick}
            >
                {i18n.t('Manage available layer sources')}
            </Button>
        </div>
    )
}

ManageLayerSourcesButton.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default ManageLayerSourcesButton
