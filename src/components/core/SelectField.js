import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    SingleSelectField,
    SingleSelectOption,
    MultiSelectField,
    MultiSelectOption,
} from '@dhis2/ui';
import styles from './styles/SelectField.module.css';

/**
 * Wrapper component around @dhis2/ui SingleSelectField and MultiSelectField
 */
export const SelectField = props => {
    const {
        errorText,
        items,
        label,
        loading,
        multiple,
        onChange,
        style,
        value,
        dataTest,
        ...extraProps
    } = props;

    const isLoading = loading === true;

    const Select = multiple ? MultiSelectField : SingleSelectField;
    const Option = multiple ? MultiSelectOption : SingleSelectOption;

    const selected = Array.isArray(value)
        ? value.map(v => String(v))
        : value !== undefined && value !== null
        ? String(value)
        : '';

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
        <div className={styles.selectField} style={style}>
            <Select
                label={label}
                selected={!isLoading ? selected : undefined}
                loading={isLoading}
                error={!!errorText}
                validationText={errorText}
                onChange={onSelectChange}
                dataTest={dataTest}
                {...extraProps}
            >
                {items &&
                    items.map(({ id, name }) => (
                        <Option
                            key={id}
                            value={String(id)}
                            label={name}
                            dataTest="selectfield-menuitem"
                        />
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
     * If set, shows the error message below the SelectField
     */
    errorText: PropTypes.string,

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
     * Override the inline-styles of the root element
     */
    style: PropTypes.object,

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
