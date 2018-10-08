import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider'; // TODO: Change when in core

const styles = theme => ({
    root: {
        width: 100,
        paddingLeft: 4,
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
