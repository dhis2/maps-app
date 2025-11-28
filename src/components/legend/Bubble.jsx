import PropTypes from 'prop-types'
import React from 'react'
import { guideLength, textPadding } from './Bubbles.jsx'

const Bubble = ({
    radius,
    maxRadius,
    text,
    textAlign,
    color,
    stroke,
    pattern,
}) => {
    const leftAlign = textAlign === 'left'
    const x = maxRadius
    const y = maxRadius * 2 - radius
    const x2 = leftAlign
        ? x - maxRadius - guideLength
        : x + maxRadius + guideLength
    const y2 = maxRadius * 2 - radius * 2
    const textX = x2 + (leftAlign ? -textPadding : textPadding)
    const textAnchor = leftAlign ? 'end' : 'start'

    return (
        <g>
            <circle
                cx={x}
                cy={y}
                r={radius}
                stroke={stroke || '#000'}
                style={{
                    fill: pattern ? `url(#${pattern})` : color || 'none',
                    strokeWidth: 0.5,
                }}
            />
            {text && (
                <g>
                    <line
                        x1={x}
                        x2={x2}
                        y1={y2}
                        y2={y2}
                        stroke="black"
                        style={{ strokeDasharray: '2, 2', strokeWidth: 0.5 }}
                    />
                    <text
                        x={textX}
                        y={y2}
                        textAnchor={textAnchor}
                        alignmentBaseline="middle"
                        style={{ fontSize: 12 }}
                    >
                        {text}
                    </text>
                </g>
            )}
        </g>
    )
}

Bubble.propTypes = {
    maxRadius: PropTypes.number.isRequired,
    radius: PropTypes.number.isRequired,
    color: PropTypes.string,
    pattern: PropTypes.string,
    stroke: PropTypes.string,
    text: PropTypes.string,
    textAlign: PropTypes.oneOf(['left', 'right']),
}

export default Bubble
