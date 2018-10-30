import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    name: {
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        padding: '6px 8px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow:
            '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',
        borderRadius: 4,
        fontSize: 14,
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
