import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
    loading: {
        marginTop: 16,
    },
    textField: {
        width: '100%',
        margin: '12px 0',
    },
    menu: {
        zIndex: 2500, // TODO: Reduce?
    },
};

const getMenuItems = (items, isMultiple, value) => {
    return items.map(item => (
        <MenuItem
            key={item.id}
            value={item.id}
            dense
            // insetChildren={isMultiple}
            // checked={isMultiple && Array.isArray(value) && value.indexOf(item.id) > -1}
        >
            {item.name}
        </MenuItem>
    ));
};

const SelectField = props => {
    const {
        label,
        items,
        multiple,
        value,
        onChange,
        style,
        loading,
        errorText,
        children,
        classes,
    } = props;

    if (loading) {
        return <CircularProgress className={classes.loading} size={48} />; // TODO: Same size as text field
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
            }}
            style={style}
        >
            {children ? children : getMenuItems(items, multiple, value)}
        </TextField>
    );
};

SelectField.propTypes = {
    classes: PropTypes.object.isRequired,

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
};

export default withStyles(styles)(SelectField);
