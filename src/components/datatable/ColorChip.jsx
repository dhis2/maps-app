import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { isDarkColor } from '../../util/colors.js'
import styles from './styles/ColorChip.module.css'

// A color code painted in its own color, in table cells and in filter lists
const ColorChip = ({ color, className, children }) => (
    <span
        className={cx(styles.chip, className, {
            [styles.light]: isDarkColor(color),
        })}
        style={{ backgroundColor: color }}
    >
        {children}
    </span>
)

ColorChip.propTypes = {
    children: PropTypes.node.isRequired,
    color: PropTypes.string.isRequired,
    className: PropTypes.string,
}

export default ColorChip
