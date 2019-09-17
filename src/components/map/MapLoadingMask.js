import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = () => ({
    mask: {
        zIndex: 990,
        backgroundColor: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const MapLoadingMask = ({ classes }) => {
    return (
        <div className={classes.mask}>
            <CircularProgress size={32} />
        </div>
    );
};

MapLoadingMask.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapLoadingMask);
