import { Checkbox as UiCheckbox } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Checkbox.module.css'

// Wrapper around @dhis2/ui checkbox for unified handling and styling
const Checkbox = ({
    label,
    checked = false,
    disabled,
    dense = true,
    onChange,
    className,
}) => (
    <div className={cx(styles.checkbox, className)}>
        <UiCheckbox
            label={label}
            checked={checked}
            dense={dense}
            disabled={disabled}
            onChange={({ checked }) => onChange(checked)}
        />
    </div>
)

Checkbox.propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    className: PropTypes.string,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    label: PropTypes.string,
}

export default Checkbox
