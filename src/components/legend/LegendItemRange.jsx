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
    decimalPlaces,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const nameLabel = name ? `${name} ` : ''
    const showRangeValue =
        startValue !== undefined && endValue !== undefined && showRange
    const precisionOpt =
        decimalPlaces !== undefined ? { precision: decimalPlaces } : undefined
    const rangeLabel = showRangeValue
        ? `${formatWithSeparator(
              startValue,
              keyAnalysisDigitGroupSeparator,
              precisionOpt
          )} - ${formatWithSeparator(
              endValue,
              keyAnalysisDigitGroupSeparator,
              precisionOpt
          )}`
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
    decimalPlaces: PropTypes.number,
    endValue: PropTypes.number,
    name: PropTypes.string,
    showRange: PropTypes.bool,
    startValue: PropTypes.number,
}

export default LegendItemRange
