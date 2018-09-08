import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider'; // TODO: Change when in core

const styles = {
    slider: {
        // float: 'left',
        width: 100,
        //marginBottom: 0,
    },
};

const OpacitySlider = ({ opacity, onChange, classes }) => (
    <Slider
        value={opacity}
        min={0}
        max={1}
        onChange={(evt, opacity) => onChange(opacity)}
        className={classes.slider}
    />
);

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OpacitySlider);
