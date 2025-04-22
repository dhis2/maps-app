import {
    SingleSelectField,
    SingleSelectOption,
    MultiSelectField,
    MultiSelectOption,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import styles from './styles/InputField.module.css'

/**
 * Wrapper component around @dhis2/ui SingleSelectField and MultiSelectField
 * Allows options to be created from an array of models (containing id and name properties)
 * id can be numbers, although @dhis2/ui requires option values to be strings.
 */
const SelectField = (props) => {
    const {
        dense = true,
        emptyText,
        errorText,
        helpText,
        warning,
        items,
        label,
        prefix,
        loading,
        multiple,
        filterable,
        disabled,
        onChange,
        className,
        value,
        dataTest,
    } = props

    const isLoading = loading === true

    const Select = multiple ? MultiSelectField : SingleSelectField
    const Option = multiple ? MultiSelectOption : SingleSelectOption

    let selected

    if (multiple) {
        selected = Array.isArray(value) ? value.map((v) => String(v)) : []
    } else {
        selected = value !== undefined && value !== null ? String(value) : ''
    }

    // Returns selected items in the original format
    const onSelectChange = useCallback(
        ({ selected }) =>
            onChange(
                multiple
                    ? items
                          .filter((item) => selected.includes(String(item.id)))
                          .map((item) => item.id)
                    : items.find((item) => String(item.id) === selected)
            ),
        [items, multiple, onChange]
    )

    return (
        <div
            className={cx(styles.inputField, className)}
            data-test="select-field-container"
        >
            <Select
                dense={dense}
                label={label}
                prefix={prefix}
                selected={!isLoading ? selected : undefined}
                filterable={filterable}
                disabled={disabled}
                loading={isLoading}
                error={!!errorText}
                warning={!!warning}
                validationText={warning ? warning : errorText}
                helpText={helpText}
                empty={emptyText}
                onChange={onSelectChange}
                dataTest={dataTest}
            >
                {items &&
                    items.map(({ id, name }) => (
                        <Option key={id} value={String(id)} label={name} />
                    ))}
            </Select>
        </div>
    )
}

SelectField.propTypes = {
    className: PropTypes.string,
    dataTest: PropTypes.string,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    emptyText: PropTypes.string, // If set, shows empty text when no options
    errorText: PropTypes.string, // If set, shows the error message below the SelectField
    filterable: PropTypes.bool,
    helpText: PropTypes.string, // If set, shows the help text below the SelectField
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            name: PropTypes.string,
        })
    ),
    label: PropTypes.string,
    // If true, spinner will be shown in the select menu. If string, the text will be shown
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    // If true, then use multiple selection. Adds a checkbox to each menu item.
    multiple: PropTypes.bool,
    prefix: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
    ]),
    warning: PropTypes.string, // If set, shows the warning message below the SelectField
    onChange: PropTypes.func,
}

export default SelectField
