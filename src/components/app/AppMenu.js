import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Toolbar } from '@material-ui/core';
import AddLayerButton from '../layers/layers/AddLayerButton';
import FileMenu from './FileMenu';
import DownloadButton from '../download/DownloadButton';
import InterpretationsToggle from '../interpretations/InterpretationsToggle';

const styles = theme => ({
    toolbar: {
        // display: 'flex',
        // position: 'relative',
        // top: 0,
        // bottom: 0,
        width: '100%',
        // height: 40,
        // minHeight: 40,
        // height: '100%',
        // height: 600,
        paddingLeft: 0,
        paddingRight: 0,
        // zIndex: 1200,

        // backgroundColor: theme.palette.background.paper,
        backgroundColor: 'yellow',
        boxShadow: `0 1px 1px 0 ${theme.palette.shadow}`,
    },
    divider: {
        // TODO: make this a standalone component for re-use as a generic vertical divider
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
        marginRight: theme.spacing(1),
    },
});

/*
export const AppMenu = ({ classes }) => (
    <Toolbar variant="dense" className={classes.toolbar}>
        <AddLayerButton />
        <span className={classes.divider} />
        <FileMenu />
        <DownloadButton />
        <InterpretationsToggle />
    </Toolbar>
);
*/

export const AppMenu = ({ classes }) => (
    <div className={classes.toolbar}>
        <AddLayerButton />
    </div>
);

AppMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppMenu);
