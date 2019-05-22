import React from 'react';
import PropTypes from 'prop-types';

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
        symbol.width = radius * 2 + 'px';
        symbol.height = radius * 2 + 'px';
        symbol.borderRadius = radius ? '50%' : '0';
    }

    return (
        <tr data-test="layerlegend-item">
            <th>
                {!weight ? (
                    // Show image or color
                    <span style={symbol} />
                ) : (
                    // Draw line
                    <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                        <path
                            stroke={color}
                            strokeWidth={weight}
                            d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
                        />
                    </svg>
                )}
            </th>
            <td>
                {name}{' '}
                {isNaN(startValue)
                    ? ''
                    : `${startValue} - ${endValue} (${count})`}
            </td>
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
