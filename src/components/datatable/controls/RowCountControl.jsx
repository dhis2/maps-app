import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/RowCountControl.module.css'

const RowCountControl = ({ totalCount, filteredCount }) => {
    if (totalCount === null || filteredCount === null) {
        return null
    }

    const label =
        filteredCount < totalCount
            ? i18n.t('{{filtered}} of {{total}} rows', {
                  filtered: filteredCount,
                  total: totalCount,
              })
            : i18n.t('{{total}} rows', { total: totalCount })

    return <span className={styles.rowCount}>{label}</span>
}

RowCountControl.propTypes = {
    filteredCount: PropTypes.number,
    totalCount: PropTypes.number,
}

export default RowCountControl
