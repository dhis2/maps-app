import { FieldGroup } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import styles from './styles/RadioGroup.module.css'

export const RadioContext = React.createContext()

const RadioGroup = ({
    value,
    label,
    helpText,
    display,
    onChange,
    boldLabel,
    compact,
    children,
    dataTest,
}) => {
    const [radio, setRadio] = useState(value)

    useEffect(() => {
        if (value !== radio) {
            setRadio(value)
        }
    }, [value, radio])

    return (
        <RadioContext.Provider value={{ radio, onChange }}>
            <div
                className={cx(styles.radioGroup, {
                    [styles.row]: display === 'row',
                    [styles.compact]: compact,
                })}
            >
                <FieldGroup
                    label={
                        <span
                            className={cx({
                                [styles.boldLabel]: boldLabel,
                                [styles.compact]: compact,
                            })}
                        >
                            {label}
                        </span>
                    }
                    helpText={helpText}
                    dataTest={dataTest}
                >
                    {children}
                </FieldGroup>
            </div>
        </RadioContext.Provider>
    )
}

RadioGroup.propTypes = {
    onChange: PropTypes.func.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
    dataTest: PropTypes.string,
    display: PropTypes.string,
    boldLabel: PropTypes.bool,
    compact: PropTypes.bool,
    helpText: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default RadioGroup
