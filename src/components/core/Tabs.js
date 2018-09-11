import React from 'react';
import PropTypes from 'prop-types';
import MuiTabs from '@material-ui/core/Tabs';

// Wrapper around MUI Tabs
const Tabs = props => (
    <MuiTabs
        indicatorColor="primary"
        textColor="primary"
        fullWidth
        {...props}
        onChange={(event, tab) => props.onChange(tab)}
    />
);

Tabs.propTypes = {
    onChange: PropTypes.func.isRequired,
};

export default Tabs;
