import { InputField } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import styles from './styles/InputField.module.css'

const toDisplay = (v) => (v === undefined || Number.isNaN(v) ? '' : String(v))

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
}) => {
    const [inputValue, setInputValue] = useState(toDisplay(value))
    const focused = useRef(false)

    // Sync display value from parent only when not focused (e.g. external reset)
    useEffect(() => {
        if (!focused.current) {
            setInputValue(toDisplay(value))
        }
    }, [value])

    return (
        <div className={cx(styles.inputField, className)}>
            <InputField
                dense={dense}
                type="number"
                min={String(min)}
                max={String(max)}
                step={String(step)}
                label={label}
                value={inputValue}
                disabled={disabled}
                onChange={({ value }) => setInputValue(value)}
                onFocus={() => {
                    focused.current = true
                }}
                onBlur={() => {
                    focused.current = false
                    const parsed = Number(inputValue)
                    onChange(Number.isNaN(parsed) ? Number.NaN : parsed)
                    setInputValue(toDisplay(parsed))
                }}
                helpText={helpText}
                inputWidth={inputWidth}
            />
        </div>
    )
}

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
