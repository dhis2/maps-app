import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MuiTabs from '@material-ui/core/Tabs';

const styles = {
    root: {
        borderBottom: '1px solid rgb(221, 221, 221)',
    },
};

// Wrapper around MUI Tabs
const Tabs = props => (
    <MuiTabs
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        {...props}
        onChange={(event, tab) => props.onChange(tab)}
    />
);

Tabs.propTypes = {
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tabs);
