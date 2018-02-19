import React from 'react';
import PropTypes from 'prop-types';

const LegendItem = ({ image, color, radius, name, startValue, endValue, count }) => {
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
        <tr>
            <th><span style={symbol}></span></th>
            <td>{name} {isNaN(startValue) ? '' : `${startValue} - ${endValue} (${count})`}</td>
        </tr>
    );
};

LegendItem.propTypes = {
    image: PropTypes.string,
    color: PropTypes.string,
    radius: PropTypes.number,
    name: PropTypes.string,
    range: PropTypes.string,
};

export default LegendItem;
