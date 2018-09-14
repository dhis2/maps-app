import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MuiTextField from '@material-ui/core/TextField';

const styles = {
    root: {
        margin: '12px 0',
        whiteSpace: 'nowrap',
    },
};

// Wrapper component around MUI TextField
const TextField = props => (
    <MuiTextField
        {...props}
        onChange={evt => props.onChange(evt.target.value)}
    />
);

TextField.propTypes = {
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TextField);
