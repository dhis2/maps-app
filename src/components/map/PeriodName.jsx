import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/PeriodName.module.css'

const PeriodName = ({ period, isTimeline }) => (
    <div
        className={`dhis2-map-period ${styles.periodName}`}
        style={isTimeline ? { bottom: 86 } : null}
    >
        <div className={styles.period}>{period}</div>
    </div>
)

PeriodName.propTypes = {
    period: PropTypes.string.isRequired,
    isTimeline: PropTypes.bool,
}

export default PeriodName
