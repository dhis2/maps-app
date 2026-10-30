import { IconChevronDown24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { isDarkColor } from '../../util/colors.js'
import styles from './styles/ColorPicker.module.css'

const ColorPicker = ({ color, label, width, height, onChange, className }) => (
    <Fragment>
        <div className={cx(styles.colorPicker, className)}>
            {label && <div className={styles.label}>{label}</div>}
            <label
                style={{
                    backgroundColor: color,
                    width: width || '100%',
                    height: height || 32,
                }}
            >
                <span
                    className={cx(styles.icon, {
                        [styles.dark]: !isDarkColor(color),
                    })}
                >
                    <IconChevronDown24 />
                </span>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                />
            </label>
        </div>
    </Fragment>
)

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default ColorPicker
