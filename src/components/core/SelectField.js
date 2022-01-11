import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    SingleSelectField,
    SingleSelectOption,
    MultiSelectField,
    MultiSelectOption,
} from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/InputField.module.css';

/**
 * Wrapper component around @dhis2/ui SingleSelectField and MultiSelectField
 * Allows options to be created from an array of models (containing id and name properties)
 * id can be numbers, although @dhis2/ui requires option values to be strings.
 */
export const SelectField = props => {
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
    } = props;

    const isLoading = loading === true;

    const Select = multiple ? MultiSelectField : SingleSelectField;
    const Option = multiple ? MultiSelectOption : SingleSelectOption;

    let selected;

    if (multiple) {
        selected = Array.isArray(value) ? value.map(v => String(v)) : [];
    } else {
        selected = value !== undefined && value !== null ? String(value) : '';
    }

    // Returns selected items in the original format
    const onSelectChange = useCallback(
        ({ selected }) =>
            onChange(
                multiple
                    ? items
                          .filter(item => selected.includes(String(item.id)))
                          .map(item => item.id)
                    : items.find(item => String(item.id) === selected)
            ),
        [items, multiple, onChange]
    );

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
    );
};

SelectField.propTypes = {
    /**
     * data-test attribute used for testing
     */
    dataTest: PropTypes.string,

    /**
     * Render a dense select field
     */
    dense: PropTypes.bool,

    /**
     * Disable the select field
     */
    disabled: PropTypes.bool,

    /**
     * If set, shows the help text below the SelectField
     */
    helpText: PropTypes.string,

    /**
     * If set, shows the error message below the SelectField
     */
    errorText: PropTypes.string,

    /**
     * If set, shows the warning message below the SelectField
     */
    warning: PropTypes.string,

    /**
     * The select field items (rendered as MenuItems)
     */
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            name: PropTypes.string,
        })
    ),

    /**
     * The label of the select field
     */
    label: PropTypes.string,

    /**
     * If true, a spinner will be shown in the select menu. If string, the loading text will be shown.
     */
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),

    /**
     * If true, the select field will support multiple selection. Adds a checkbox to each menu item.
     */
    multiple: PropTypes.bool,

    /**
     * onChange callback, that is fired when the select field's value changes
     *
     * The onChange callback will receive one argument: The item selected if not multiple, or an array of
     * ids if multiple.
     */
    onChange: PropTypes.func,

    /**
     * Class name for the root element
     */
    className: PropTypes.string,

    /**
     * The value(s) of the select field
     */
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
    ]),
};

export default SelectField;
