import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import colorbrewer from '../../constants/colorbrewer';
import styles from './styles/ColorScale.module.css';

// Returns one color scale based on a code and number of classes
const ColorScale = ({ scale, bins, width, className, onClick }) => {
    const colors = colorbrewer[scale][bins];
    const itemWidth = width ? width / bins : 36;

    return (
        <ul
            onClick={() => onClick(scale)}
            className={cx(styles.colorScale, className)}
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
    className: PropTypes.string,
};

export default ColorScale;
