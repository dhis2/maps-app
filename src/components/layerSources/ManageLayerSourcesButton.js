import { useCachedDataQuery } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { MAPS_ADMIN_AUTHORITY_IDS } from '../../constants/settings.js'
import styles from './styles/ManageLayerSourcesButton.module.css'

const ManageLayerSourcesButton = ({ onClick }) => {
    const { currentUser } = useCachedDataQuery()
    const isMapsAdmin = MAPS_ADMIN_AUTHORITY_IDS.some(id =>
        currentUser.authorities.has(id)
    )

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
