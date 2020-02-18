import React from 'react';
import { Radio as MuiRadio, FormControlLabel } from '@material-ui/core';

// Wrapper around MUI Radio with label support
const Radio = props => (
    <FormControlLabel {...props} control={<MuiRadio color="primary" />} />
);

export default Radio;
