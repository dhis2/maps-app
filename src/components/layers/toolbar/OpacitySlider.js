import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@material-ui/core';
import styles from './styles/OpacitySlider.module.css';

/*
const styles = theme => ({
    root: {
        width: 100,
        background: 'yellow',
    },
    track: {
        backgroundColor: theme.palette.action.active,
    },
    thumb: {
        backgroundColor: theme.palette.action.active,
    },
});
*/

const OpacitySlider = ({ opacity, onChange }) => (
    <div className={styles.slider}>
        <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(evt, opacity) => onChange(opacity)}
            // classes={classes}
        />
    </div>
);

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OpacitySlider;
