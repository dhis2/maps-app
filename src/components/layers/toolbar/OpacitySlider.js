import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Slider } from '@material-ui/core';

const styles = theme => ({
    root: {
        width: 100,
        marginTop: 4,
    },
    track: {
        backgroundColor: theme.palette.action.active,
    },
    thumb: {
        backgroundColor: theme.palette.action.active,
    },
});

const OpacitySlider = ({ opacity, onChange, classes }) => (
    <Slider
        value={opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(evt, opacity) => onChange(opacity)}
        classes={classes}
    />
);

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OpacitySlider);
