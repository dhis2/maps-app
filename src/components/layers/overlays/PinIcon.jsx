import PropTypes from 'prop-types'
import React from 'react'

// Pin / pinFill glyphs - @dhis2/ui has no pin icon, so these are inlined.
// fill="currentColor" so the surrounding CSS colour applies.
const PinIcon = ({ filled }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
    >
        {filled ? (
            <path d="M9.618 1.076a1 1 0 0 1 1.09.217l4 4A1 1 0 0 1 14 7h-1.46l-.029.055a59.76 59.76 0 0 1-1.098 1.966c-.783 1.338-1.784 2.912-2.72 3.966l.66.66-.707.707-.996-.996-.005-.004L5.5 11.207 1.708 15H1v-.707L4.792 10.5 2.646 8.354l-.004-.005-.995-.995.707-.707.714.713L9 3.547V2a1 1 0 0 1 .618-.924Z" />
        ) : (
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.617 1.076a1 1 0 0 1 1.09.217l4 4A1 1 0 0 1 14 7h-1.548L8.64 12.932l.715.714-.708.707L5.5 11.207 1.707 15H1v-.707L4.793 10.5 1.646 7.354l.708-.707.713.713L9 3.548V2a1 1 0 0 1 .617-.924ZM3.792 8.085l4.122 4.122 3.67-5.709-2.083-2.083-5.709 3.67ZM10 3.5 12.5 6H14l-4-4v1.5Z"
            />
        )}
    </svg>
)

PinIcon.propTypes = {
    filled: PropTypes.bool,
}

export default PinIcon
