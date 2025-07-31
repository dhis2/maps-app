import { InputField } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/InputField.module.css'

// Wrapper component around @dhis2/ui InputField
const TextField = ({
    type,
    label,
    value,
    dense = true,
    onChange,
    className,
}) => (
    <div className={cx(styles.inputField, className)}>
        <InputField
            dense={dense}
            type={type}
            label={label}
            value={value}
            onChange={({ value }) => onChange(value)}
        />
    </div>
)

TextField.propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    dense: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
}

export default TextField
