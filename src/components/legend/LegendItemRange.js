import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/LegendItemRange.module.css'

const LegendItemRange = ({ name = '', startValue, endValue, count }) => (
    <td className={styles.legendItemRange}>
        {isNaN(startValue) ? name : `${name} ${startValue} - ${endValue}`}
        {count !== undefined ? ` (${count})` : ''}
    </td>
)

LegendItemRange.propTypes = {
    count: PropTypes.number,
    endValue: PropTypes.number,
    name: PropTypes.string,
    startValue: PropTypes.number,
}

export default LegendItemRange
