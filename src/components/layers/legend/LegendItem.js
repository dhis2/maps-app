import React from 'react';
import PropTypes from 'prop-types';
import './LegendItem.css';

const LegendItem = ({ image, color, radius, name, range }) => {
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
        <div className='LegendItem'>
            <dt><span style={symbol}></span></dt>
            <dd>{name} {range}</dd>
        </div>
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
