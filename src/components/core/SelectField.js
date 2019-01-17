import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';

const styles = {
    loading: {
        marginTop: 16,
    },
    textField: {
        width: '100%',
        margin: '12px 0',
    },
    menu: {
        zIndex: 2500,
    },
    menuItem: {
        paddingLeft: 0,
    },
};

/**
 * Wrapper component around MUI TextField supporting default styling, labels, error text,
 * multiple select, and rendering select items from an array of objects.
 * https://github.com/dhis2/d2-ui/blob/master/packages/core/src/select-field/SelectField.js
 */

export const SelectField = props => {
    const {
        classes,
        errorText,
        items = [],
        label,
        loading,
        multiple,
        onChange,
        style,
        value,
        ...extraProps
    } = props;

    if (loading) {
        return <CircularProgress className={classes.loading} size={32} />;
    }

    return (
        <TextField
            select
            label={label}
            value={value ? value : multiple ? [] : ''}
            onChange={event =>
                onChange(
                    multiple
                        ? event.target.value
                        : items.find(item => item.id === event.target.value)
                )
            }
            error={errorText ? true : false}
            helperText={errorText}
            className={classes.textField}
            SelectProps={{
                MenuProps: {
                    className: classes.menu,
                },
                multiple,
                renderValue:
                    multiple &&
                    (selected =>
                        selected
                            .map(id => items.find(item => item.id === id).name)
                            .join(', ')),
            }}
            style={style}
            {...extraProps}
        >
            {items.map(({ id, name }) => (
                <MenuItem
                    key={id}
                    value={id}
                    dense
                    className={multiple && classes.menuItem}
                    data-test="selectfield-menuitem"
                >
                    {multiple && (
                        <Checkbox
                            checked={
                                Array.isArray(value) && value.indexOf(id) >= 0
                            }
                        />
                    )}
                    {name}
                </MenuItem>
            ))}
        </TextField>
    );
};

SelectField.propTypes = {
    /**
     * The styles applied to the component using withStyles.
     */
    classes: PropTypes.object.isRequired,

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

export default withStyles(styles)(SelectField);
