import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { scaleSqrt } from 'd3-scale';
import Bubble from './Bubble';
import { getContrastColor } from '../../util/colors';
import { getLongestTextLength } from '../../util/helpers';

const style = {
    paddingTop: 10,
};

const legendWidth = 245;
const digitWidth = 6.8;
export const guideLength = 16;
export const textPadding = 4;

const Bubbles = ({ radiusLow, radiusHigh, color, classes }) => {
    const height = radiusHigh * 2 + 4;
    const scale = scaleSqrt().range([radiusLow, radiusHigh]);
    const radiusMid = scale(0.5);

    if (isNaN(radiusLow) || isNaN(radiusHigh)) {
        return null;
    }

    let bubbles = [];

    // If color legend
    if (Array.isArray(classes) && classes.length) {
        const startValue = classes[0].startValue;
        const endValue = classes[classes.length - 1].endValue;
        const itemScale = scale.domain([startValue, endValue]);

        bubbles = [...classes].reverse().map(c => ({
            radius: itemScale(c.endValue),
            maxRadius: radiusHigh,
            color: c.color,
            text: String(c.endValue),
        }));

        // Add the smallest bubble for the lowest value
        bubbles.push({
            radius: itemScale(startValue),
            maxRadius: radiusHigh,
            text: String(startValue),
        });
    } else {
        // If single color
        const stroke = color && getContrastColor(color);

        bubbles = [
            {
                radius: radiusHigh,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: i18n.t('Max'),
            },
            {
                radius: radiusMid,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: i18n.t('Mid'),
            },
            {
                radius: radiusLow,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: i18n.t('Min'),
            },
        ];
    }

    // Calculate the pixel length of the longest number
    let textLength = Math.ceil(
        Math.max(
            getLongestTextLength(classes, 'startValue'),
            getLongestTextLength(classes, 'endValue')
        ) * digitWidth
    );

    // Calculate the total length if numbers are alternate on each side
    const alternateLength =
        (radiusHigh + guideLength + textPadding + textLength) * 2;

    let smallestGap = bubbles.reduce((prev, curr, i) => {
        const gap = prev.radius - curr.radius;
        const smallestGap =
            prev.gap === undefined || gap < prev.gap ? gap : prev.gap;

        return i === bubbles.length - 1
            ? Math.round(smallestGap * 2)
            : {
                  radius: curr.radius,
                  gap: smallestGap,
              };
    });

    const alternateFit = alternateLength < legendWidth;

    const alternate = alternateFit && smallestGap > 5 && smallestGap < 12;

    if (!alternateFit) {
        smallestGap = smallestGap / 2;
    }

    // Too cramped to show number for each bubble
    if (smallestGap < 6) {
        const [maxBubble] = bubbles;
        const minBubble = bubbles[bubbles.length - 1];
        const gap = maxBubble.radius - minBubble.radius;
        const showNumbers = [0]; // Always show largest number

        if (gap > 6) {
            showNumbers.push(bubbles.length - 1);
        }

        if (gap > 15) {
            const midRadius = minBubble.radius + gap / 2;

            // Find the closest bubble above the mid radius
            const midBubble = bubbles.reduce((prev, curr) =>
                curr.radius >= midRadius &&
                curr.radius - midRadius < prev.radius - midRadius
                    ? curr
                    : prev
            );

            showNumbers.push(bubbles.indexOf(midBubble));
        }

        bubbles.forEach((b, i) => {
            if (!showNumbers.includes(i)) {
                delete b.text;
            }
        });
    }

    textLength = Math.ceil(getLongestTextLength(bubbles, 'text') * digitWidth);

    const offset = textLength + guideLength + textPadding;

    return (
        <div style={style}>
            <svg width={legendWidth} height={height + 20}>
                <g transform={`translate(${alternate ? offset : '2'} 10)`}>
                    {bubbles.map((bubble, i) => (
                        <Bubble
                            key={i}
                            {...bubble}
                            textAlign={
                                alternate && i % 2 == 0 ? 'left' : 'right'
                            }
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

Bubbles.propTypes = {
    radiusLow: PropTypes.number.isRequired,
    radiusHigh: PropTypes.number.isRequired,
    color: PropTypes.string,
    classes: PropTypes.array,
};

export default Bubbles;
