import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'material-ui/Slider';

const styles = {
    container: {
        float: 'left',
        width: 100,
        marginBottom: 0,
    },
    slider: {
        margin: 8,
    },
};

const OpacitySlider = ({ opacity, onChange }) => (
    <Slider
        defaultValue={opacity}
        onChange={(evt, opacity) => onChange(opacity)}
        style={styles.container}
        sliderStyle={styles.slider}
    />
);

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OpacitySlider;
