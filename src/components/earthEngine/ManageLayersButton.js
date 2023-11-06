import i18n from '@dhis2/d2-i18n'
import { useCachedDataQuery } from '@dhis2/analytics'
import React from 'react'
import { Button } from '@dhis2/ui'
import { MAPS_ADMIN_AUTHORITY_ID } from '../../constants/settings.js'
import styles from './styles/ManageLayersButton.module.css'

const ManageLayersButton = ({ onClick }) => {
    const { currentUser } = useCachedDataQuery()
    const isMapsAdmin = currentUser.authorities.has(MAPS_ADMIN_AUTHORITY_ID)

    if (!isMapsAdmin) {
        return null
    }

    return (
        <div className={styles.button}>
            <Button small secondary onClick={onClick}>
                {i18n.t('Manage available layers')}
            </Button>
        </div>
    )
}

export default ManageLayersButton
