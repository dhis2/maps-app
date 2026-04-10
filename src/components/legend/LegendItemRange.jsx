import PropTypes from 'prop-types'
import React from 'react'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/LegendItemRange.module.css'

const LegendItemRange = ({
    name = '',
    showRange = true,
    startValue,
    endValue,
    count,
}) => {
    const {
        //systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const keyAnalysisDigitGroupSeparator = 'COMMA'
    const nameLabel = name ? `${name} ` : ''
    const showRangeValue =
        startValue !== undefined && endValue !== undefined && showRange
    const rangeLabel = showRangeValue
        ? `${formatWithSeparator(
              startValue,
              keyAnalysisDigitGroupSeparator
          )} - ${formatWithSeparator(endValue, keyAnalysisDigitGroupSeparator)}`
        : ''
    const countLabel =
        count === undefined
            ? ''
            : ` (${formatWithSeparator(count, keyAnalysisDigitGroupSeparator)})`
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
