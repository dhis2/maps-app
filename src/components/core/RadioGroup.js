import { FieldGroup } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import styles from './styles/RadioGroup.module.css'

export const RadioContext = React.createContext()

const RadioGroup = ({
    value,
    label = '',
    helpText = '',
    display = 'column',
    onChange,
    boldLabel = false,
    compact = false,
    children,
    dataTest,
}) => {
    const [radio, setRadio] = useState(value)

    useEffect(() => {
        setRadio(value)
    }, [value])

    return (
        <RadioContext.Provider value={{ radio, onChange }}>
            <div
                className={cx(styles.radioGroup, {
                    [styles.row]: display === 'row',
                    [styles.compact]: compact,
                })}
            >
                {label && (
                    <div
                        className={cx({
                            [styles.boldLabel]: boldLabel,
                            [styles.compact]: compact,
                        })}
                    >
                        {label}
                    </div>
                )}
                <FieldGroup helpText={helpText} dataTest={dataTest}>
                    {children}
                </FieldGroup>
            </div>
        </RadioContext.Provider>
    )
}

RadioGroup.propTypes = {
    onChange: PropTypes.func.isRequired,
    boldLabel: PropTypes.bool,
    children: PropTypes.arrayOf(PropTypes.node),
    compact: PropTypes.bool,
    dataTest: PropTypes.string,
    display: PropTypes.oneOf(['row', 'column']),
    helpText: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default RadioGroup
