import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AddLayer from '../layers/layers/AddLayer';
import FileMenu from './FileMenu';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';

const styles = {
    toolbar: {
        position: 'absolute',
        width: '100%',
        height: 40,
        minHeight: 40,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: '#f3f3f3',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.227451)',
        zIndex: 1200,
    }
};

export const AppMenu = ({ classes }) => (
    <Toolbar variant="dense" className={classes.toolbar}>
        <AddLayer />
        <FileMenu />
        <InterpretationsToggle />
    </Toolbar>
);

AppMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppMenu);
