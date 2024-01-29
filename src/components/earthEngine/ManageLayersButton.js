import { useCachedDataQuery } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
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

ManageLayersButton.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default ManageLayersButton
