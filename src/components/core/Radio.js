import React from 'react';
import PropTypes from 'prop-types';
import MuiRadio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';

// Wrapper around MUI Radio with label support
const Radio = (props) => (
    <FormControlLabel
        {...props}
        control={<MuiRadio />}
    />
);

Radio.propTypes = {
};

export default Radio;
