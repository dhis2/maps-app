import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { scaleSqrt, scaleLinear } from 'd3-scale';

// Proportional symbols or bubble map?
// https://github.com/d3/d3-scale
// https://www.d3-graph-gallery.com/graph/bubble_legend.html
// https://makingmaps.net/2007/08/28/perceptual-scaling-of-map-symbols/
// https://codepen.io/mxfh/pen/pggXoW

// https://blog.mastermaps.com/2008/06/proportional-symbols-in-three.html
const scaleModes = {
    linear: scaleSqrt(),
    // linear: scaleLinear(), // scaleSqrt(),
    perceptual: scaleLinear().interpolate((min, max) => x => {
        const radius = min + (max - min) * x;

        // https://gis.stackexchange.com/questions/97902/flannery-compensation-in-leaflet-js
        const pRadius = 1.0083 * Math.pow(radius / min, 0.5716) * min;
        console.log('x', x, radius, pRadius);
        return radius;
    }),
};

const Symbol = ({ radius, maxRadius, text }) => {
    const x = maxRadius;
    const y = maxRadius * 2 - radius;
    const x2 = maxRadius * 2 + 16;
    const y2 = maxRadius * 2 - radius * 2;

    return (
        <g transform="translate(10 10)">
            <circle
                cx={x}
                cy={y}
                r={radius}
                stroke="black"
                style={{ fill: 'none' }}
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

Symbol.propTypes = {
    radius: PropTypes.number.isRequired,
    maxRadius: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
};

const Bubbles = ({ radiusLow, radiusHigh }) => {
    const height = radiusHigh * 2 + 4;
    // const scale = scaleModes['linear'].range([radiusLow, radiusHigh]);
    const scale = scaleModes['linear'].range([0, radiusHigh]);
    const radiusMid = scale(0.5);

    if (isNaN(radiusLow) || isNaN(radiusHigh)) {
        return null;
    }

    return (
        <svg width="260" height={height + 20}>
            <Symbol
                radius={radiusLow}
                maxRadius={radiusHigh}
                text={i18n.t('Min')}
            />
            <Symbol
                radius={radiusMid}
                maxRadius={radiusHigh}
                text={i18n.t('Mid')}
            />
            <Symbol
                radius={radiusHigh}
                maxRadius={radiusHigh}
                text={i18n.t('Max')}
            />
        </svg>
    );
};

Bubbles.propTypes = {
    radiusLow: PropTypes.number.isRequired,
    radiusHigh: PropTypes.number.isRequired,
};

export default Bubbles;
