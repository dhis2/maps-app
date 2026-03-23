import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/LegendItemRange.module.css'

const LegendItemRange = ({
    name = '',
    showRange = true,
    startValue,
    endValue,
    count,
}) => {
    const nameLabel = name ? `${name} ` : ''
    const showRangeValue =
        startValue !== undefined && endValue !== undefined && showRange
    const rangeLabel = showRangeValue ? `${startValue} - ${endValue}` : ''
    const countLabel = count !== undefined ? ` (${count})` : ''
    return (
        <td className={styles.legendItemRange}>
            {nameLabel}
            {rangeLabel}
            {countLabel}
        </td>
    )
}

LegendItemRange.propTypes = {
    count: PropTypes.number,
    endValue: PropTypes.number,
    name: PropTypes.string,
    showRange: PropTypes.bool,
    startValue: PropTypes.number,
}

export default LegendItemRange
