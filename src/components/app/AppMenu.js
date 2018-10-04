import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AddLayer from '../layers/layers/AddLayer';
import FileMenu from './FileMenu';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';

const styles = theme => ({
    toolbar: {
        position: 'absolute',
        width: '100%',
        height: 40,
        minHeight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        zIndex: 1200,

        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 1px 1px 0 ${theme.palette.shadow}`,
    },
    divider: {
        // TODO: make this a standalone component for re-use as a generic vertical divider
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
    },
});

export const AppMenu = ({ classes }) => (
    <Toolbar variant="dense" className={classes.toolbar}>
        <AddLayer />
        <span className={classes.divider} />
        <FileMenu />
        <InterpretationsToggle />
    </Toolbar>
);

AppMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppMenu);
