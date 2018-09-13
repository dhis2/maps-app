import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import MuiTab from '@material-ui/core/Tab';

const styles = {
    root: {
        minWidth: 0,
        fontSize: 14,
    },
};

// Styled wrapper around MUI Tab
const Tab = props => <MuiTab {...props} />;

export default withStyles(styles)(Tab);
