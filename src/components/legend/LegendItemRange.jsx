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
    const range = `${startValue} - ${endValue}`
    const showRangeValue =
        !Number.isNaN(startValue) && !Number.isNaN(endValue) && showRange
    const displayName = showRangeValue
        ? `${name ? name + ' ' : ''}${range}`
        : name

    return (
        <td className={styles.legendItemRange}>
            {displayName}
            {count !== undefined ? ` (${count})` : ''}
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
