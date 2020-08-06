import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { scaleSqrt } from 'd3-scale';
import Bubble from './Bubble';

// https://github.com/d3/d3-scale
// https://www.d3-graph-gallery.com/graph/bubble_legend.html
// https://makingmaps.net/2007/08/28/perceptual-scaling-of-map-symbols/
// https://codepen.io/mxfh/pen/pggXoW

// https://blog.mastermaps.com/2008/06/proportional-symbols-in-three.htm
/*
const scaleModes = {
    linear: scaleSqrt(),
    // linear: scaleLinear(), // scaleSqrt(),
    perceptual: scaleLinear().interpolate((min, max) => x => {
        const radius = min + (max - min) * x;

        // https://gis.stackexchange.com/questions/97902/flannery-compensation-in-leaflet-js
        // const pRadius = 1.0083 * Math.pow(radius / min, 0.5716) * min;
        // console.log('x', x, radius, pRadius);
        return radius;
    }),
};
*/

const Bubbles = ({ radiusLow, radiusHigh }) => {
    const height = radiusHigh * 2 + 4;
    const scale = scaleSqrt().range([radiusLow, radiusHigh]);
    const radiusMid = scale(0.5);

    if (isNaN(radiusLow) || isNaN(radiusHigh)) {
        return null;
    }

    return (
        <svg width="260" height={height + 20}>
            <Bubble
                radius={radiusLow}
                maxRadius={radiusHigh}
                text={i18n.t('Min')}
            />
            <Bubble
                radius={radiusMid}
                maxRadius={radiusHigh}
                text={i18n.t('Mid')}
            />
            <Bubble
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
