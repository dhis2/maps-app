import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { formatWithSeparator } from '../../../util/numbers.js'
import styles from './styles/RowCountControl.module.css'

const RowCountControl = ({
    totalCount,
    filteredCount,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (totalCount === null || filteredCount === null) {
        return null
    }

    const total = formatWithSeparator(
        totalCount,
        keyAnalysisDigitGroupSeparator
    )
    const filtered = formatWithSeparator(
        filteredCount,
        keyAnalysisDigitGroupSeparator
    )

    const label =
        filteredCount < totalCount
            ? i18n.t('{{filtered}} of {{total}} rows', { filtered, total })
            : i18n.t('{{total}} rows', { total })

    return <span className={styles.rowCount}>{label}</span>
}

RowCountControl.propTypes = {
    filteredCount: PropTypes.number,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    totalCount: PropTypes.number,
}

export default RowCountControl
