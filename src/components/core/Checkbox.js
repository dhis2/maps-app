import { Checkbox as UiCheckbox, Tooltip, IconInfo16 } from '@dhis2/ui'
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
    tooltip,
    onChange,
    className,
    dataTest,
}) => (
    <div className={cx(styles.checkbox, className)} data-test={dataTest}>
        <UiCheckbox
            label={label}
            checked={checked}
            dense={dense}
            disabled={disabled}
            onChange={({ checked }) => onChange(checked)}
        />
        {tooltip && (
            <Tooltip content={tooltip}>
                <IconInfo16 />
            </Tooltip>
        )}
    </div>
)

Checkbox.propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    className: PropTypes.string,
    dataTest: PropTypes.string,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    tooltip: PropTypes.string,
}

export default Checkbox
