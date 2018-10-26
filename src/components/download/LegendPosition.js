import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const styles = theme => ({
    root: {
        width: 120,
    },
    position: {
        position: 'relative',
        display: 'inline-block',
        backgroundColor: theme.palette.background.default,
        width: 50,
        height: 50,
        margin: '1px 5px',
        outline: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
    },
    legend: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: theme.palette.action.active,
    },
    selected: {
        outline: `3px solid ${theme.palette.primary.main}`,
    },
    'top-left': {
        top: 8,
        left: 8,
    },
    'top-right': {
        top: 8,
        right: 8,
    },
    'bottom-left': {
        bottom: 8,
        left: 8,
    },
    'bottom-right': {
        bottom: 8,
        right: 8,
    },
});

const LegendPosition = ({ position, onChange, classes }) => (
    <div className={classes.root}>
        {positions.map(pos => (
            <div
                key={pos}
                className={`${classes.position} ${
                    pos === position ? classes.selected : ''
                }`}
                onClick={pos !== position ? () => onChange(pos) : null}
            >
                <div className={`${classes.legend} ${classes[pos]}`} />
            </div>
        ))}
    </div>
);

LegendPosition.propTypes = {
    position: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LegendPosition);
