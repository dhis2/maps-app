import { IconChevronDown16, IconChevronDown24 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { isDarkColor } from '../../util/colors.js'
import styles from './styles/ColorPicker.module.css'

// The native <input type="color"> needs a real hex value to function as a
// controlled input — used only for that, never shown as the swatch's fill.
const FALLBACK_INPUT_COLOR = '#000000'

const ColorPicker = ({
    color,
    label,
    width,
    height,
    onChange,
    className,
    centerIcon,
}) => {
    const swatchHeight = height || 32
    const isCompact = swatchHeight <= 24
    const Chevron = isCompact ? IconChevronDown16 : IconChevronDown24
    const isUnset = !color

    return (
        <Fragment>
            <div className={cx(styles.colorPicker, className)}>
                {label && <div className={styles.label}>{label}</div>}
                <label
                    className={cx({ [styles.unset]: isUnset })}
                    style={{
                        backgroundColor: isUnset ? undefined : color,
                        width: width || '100%',
                        height: swatchHeight,
                    }}
                >
                    <span
                        className={cx(
                            centerIcon ? styles.iconCentered : styles.icon,
                            { [styles.dark]: isUnset || !isDarkColor(color) }
                        )}
                        style={
                            !centerIcon && isCompact
                                ? { height: 16 }
                                : undefined
                        }
                    >
                        <Chevron />
                    </span>
                    <input
                        type="color"
                        value={color || FALLBACK_INPUT_COLOR}
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                    />
                </label>
            </div>
        </Fragment>
    )
}

ColorPicker.propTypes = {
    onChange: PropTypes.func.isRequired,
    centerIcon: PropTypes.bool,
    className: PropTypes.string,
    color: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default ColorPicker
