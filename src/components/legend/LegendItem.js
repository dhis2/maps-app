import React from 'react';
import PropTypes from 'prop-types';
import LineSymbol from './LineSymbol';
import LegendItemRange from './LegendItemRange';
import styles from './styles/LegendItem.module.css';

const maxRadius = 15;

const LegendItem = ({
    image,
    color,
    radius,
    weight,
    name,
    startValue,
    endValue,
    count,
}) => {
    if (!name && startValue === undefined) {
        return null;
    }

    const symbol = {
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundColor: color ? color : 'transparent',
    };

    if (radius) {
        const r = Math.min(radius, maxRadius) * 2;

        symbol.width = `${r}px`;
        symbol.height = `${r}px`;
        symbol.borderRadius = '50%';
    }

    return (
        <tr className={styles.legendItem} data-test="layerlegend-item">
            <th>
                {weight ? (
                    <LineSymbol color={color} weight={weight} />
                ) : (
                    <span style={symbol} />
                )}
            </th>
            <LegendItemRange
                name={name}
                startValue={startValue}
                endValue={endValue}
                count={count}
            />
        </tr>
    );
};

LegendItem.propTypes = {
    image: PropTypes.string,
    color: PropTypes.string,
    radius: PropTypes.number,
    weight: PropTypes.number,
    name: PropTypes.string,
    startValue: PropTypes.number,
    endValue: PropTypes.number,
    count: PropTypes.number,
};

export default LegendItem;
