import i18n from '@dhis2/d2-i18n'
import { Tooltip, IconDelete24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/RemoveFilter.module.css'

// Remove filter button used for both thematic and event filters
const RemoveFilter = ({ onClick }) => (
    <div className={styles.removeBtnContainer} onClick={onClick}>
        <Tooltip content={i18n.t('Remove filter')}>
            <IconDelete24 />
        </Tooltip>
    </div>
)

RemoveFilter.propTypes = {
    onClick: PropTypes.func.isRequired,
}

export default RemoveFilter
