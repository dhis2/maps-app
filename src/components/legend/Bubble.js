import React from 'react';
import PropTypes from 'prop-types';

const Bubble = ({ radius, maxRadius, color, text }) => {
    const x = maxRadius;
    const y = maxRadius * 2 - radius;
    const x2 = maxRadius * 2 + 16;
    const y2 = maxRadius * 2 - radius * 2;

    // console.log('bubble');

    return (
        <g transform="translate(2 10)">
            <circle
                cx={x}
                cy={y}
                r={radius}
                stroke="black"
                style={{ fill: color ? color : 'none' }}
            />
            <line
                x1={x}
                x2={x2}
                y1={y2}
                y2={y2}
                stroke="black"
                style={{ strokeDasharray: '2, 2' }}
            />
            <text
                x={x2}
                y={y2}
                alignmentBaseline="middle"
                style={{ fontSize: 12 }}
            >
                {text}
            </text>
        </g>
    );
};

Bubble.propTypes = {
    radius: PropTypes.number.isRequired,
    maxRadius: PropTypes.number.isRequired,
    color: PropTypes.string,
    text: PropTypes.string.isRequired,
};

export default Bubble;
