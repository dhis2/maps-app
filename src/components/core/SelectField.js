import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';

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
    insetItem: {
        paddingLeft: 48,
    },
    checkIcon: {
        position: 'absolute',
        left: 10,
    },
};

// https://github.com/dhis2/d2-ui/blob/master/packages/core/src/select-field/SelectField.js
const SelectField = props => {
    const {
        label,
        items = [],
        multiple,
        value,
        onChange,
        style,
        loading,
        errorText,
        classes,
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
        >
            {items.map(({ id, name }) => (
                <MenuItem
                    key={id}
                    value={id}
                    dense
                    className={multiple && classes.insetItem}
                >
                    {multiple &&
                        Array.isArray(value) &&
                        value.includes(id) && (
                            <CheckIcon className={classes.checkIcon} />
                        )}
                    {name}
                </MenuItem>
            ))}
        </TextField>
    );
};

SelectField.propTypes = {
    classes: PropTypes.object.isRequired,

    /**
     * The label of the select field
     */
    label: PropTypes.string,

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
     * If true, the select field will support multiple selection. A check mark will show before selected items.
     */
    multiple: PropTypes.bool,

    /**
     * If true, a spinner will be shown in the select menu. If string, the loading text will be shown.
     */
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),

    /**
     * onChange callback, that is fired when the select field's value changes
     *
     * The onChange callback will receive one argument: The item selected if not multiple, or an array of
     * ids if multiple.
     */
    onChange: PropTypes.func,

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

    /**
     * Override the inline-styles of the root element
     */
    style: PropTypes.object,

    /**
     * If set, shows the error message below the SelectField
     */
    errorText: PropTypes.string,
};

export default withStyles(styles)(SelectField);
