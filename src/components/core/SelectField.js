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
export const SelectField = (props) => {
    const {
        dense = true,
        errorText,
        helpText,
        warning,
        items,
        label,
        loading,
        multiple,
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
        <div className={cx(styles.inputField, className)}>
            <Select
                dense={dense}
                label={label}
                selected={!isLoading ? selected : undefined}
                disabled={disabled}
                loading={isLoading}
                error={!!errorText}
                warning={!!warning}
                validationText={warning ? warning : errorText}
                helpText={helpText}
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
    errorText: PropTypes.string,
    helpText: PropTypes.string,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            name: PropTypes.string,
        })
    ),
    label: PropTypes.string,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    multiple: PropTypes.bool,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
    ]),
    warning: PropTypes.string,
    onChange: PropTypes.func,
}

export default SelectField
