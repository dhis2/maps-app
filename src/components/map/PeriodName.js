import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    period: {
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        bottom: 16,
        left: 10,
        right: 10,
        zIndex: 999,
        '& div': {
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: theme.shadows[1],
            borderRadius: theme.shape.borderRadius,
            padding: '3px 5px',
            fontSize: 12,
        },
    },
});

const PeriodName = ({ period, classes }) => (
    <div className={classes.period}>
        <div>{period}</div>
    </div>
);

PeriodName.propTypes = {
    period: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PeriodName);
