import React from 'react';
import PropTypes from 'prop-types';
import colorbrewer from '../../constants/colorbrewer';
import styles from './styles/ColorScale.module.css';

// Returns one color scale based on a code and number of classes
const ColorScale = ({ scale, bins, width, onClick }) => {
    const colors = colorbrewer[scale][bins];
    const itemWidth = width ? width / bins : 36;

    return (
        <ul
            onClick={() => onClick(scale)}
            className={styles.colorScale}
            style={{
                ...(width && { width }),
            }}
        >
            {colors.map((color, index) => (
                <li
                    key={index}
                    className={styles.item}
                    style={{ backgroundColor: color, width: itemWidth }}
                />
            ))}
        </ul>
    );
};

ColorScale.propTypes = {
    bins: PropTypes.number.isRequired,
    scale: PropTypes.string.isRequired,
    width: PropTypes.number,
    onClick: PropTypes.func.isRequired,
};

export default ColorScale;
