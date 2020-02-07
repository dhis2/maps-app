import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    name: {
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        top: 8,
        left: 50,
        right: 50,
        zIndex: 998,
        '& div': {
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: theme.shadows[1],
            borderRadius: theme.shape.borderRadius,
            padding: '5px 8px 3px',
            fontSize: 12,
            textAlign: 'center',
            lineHeight: '18px',
        },
    },
});

const MapName = ({ name, classes }) => (
    <div className={classes.name}>
        <div>{name}</div>
    </div>
);

MapName.propTypes = {
    name: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapName);
