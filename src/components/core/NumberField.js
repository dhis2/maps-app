import { InputField } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/InputField.module.css'

const NumberField = ({
    label,
    value,
    min,
    max,
    step = 1,
    dense = true,
    disabled,
    helpText,
    inputWidth,
    onChange,
    className,
}) => (
    <div className={cx(styles.inputField, className)}>
        <InputField
            dense={dense}
            type="number"
            min={String(min)}
            max={String(max)}
            step={String(step)}
            label={label}
            value={Number.isNaN(value) ? '' : String(value)}
            disabled={disabled}
            onChange={({ value }) => onChange(value)}
            helpText={helpText}
            inputWidth={inputWidth}
        />
    </div>
)

NumberField.propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    helpText: PropTypes.string,
    inputWidth: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default NumberField
