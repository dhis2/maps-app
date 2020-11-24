import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles/ColorButton.module.css';

const ColorButton = ({ color, onChange, className }) => (
    <label
        className={cx(styles.colorButton, className)}
        style={{
            backgroundImage: `radial-gradient(
                        circle, ${color} 35%, transparent 40%
                    )`,
        }}
    >
        <input
            type="color"
            value={color}
            onChange={e => onChange(e.target.value.toUpperCase())}
        />
    </label>
);

ColorButton.propTypes = {
    color: PropTypes.string.isRequired,
    label: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    button: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default ColorButton;
