import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    name: {
        position: 'absolute',
        fontFamily: 'Arial, Helvetica, sans-serif!important',
        top: theme.spacing.unit,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        padding: '6px 8px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: theme.shadows[1],
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
    },
});

const MapName = ({ name, classes }) => (
    <div className={classes.name}>{name}</div>
);

MapName.propTypes = {
    name: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapName);
