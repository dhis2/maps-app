import PropTypes from 'prop-types'
import React from 'react'

export const SortIcon = ({ direction }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        style={{ display: 'block' }}
    >
        <g fill="none" fillRule="evenodd">
            <polygon
                fill={
                    direction === 'desc'
                        ? 'var(--colors-blue700)'
                        : 'var(--colors-grey500)'
                }
                points="4 9 12 9 8 14"
            />
            <polygon
                fill={
                    direction === 'asc'
                        ? 'var(--colors-blue700)'
                        : 'var(--colors-grey500)'
                }
                points="4 7 12 7 8 2"
            />
        </g>
    </svg>
)

SortIcon.propTypes = {
    direction: PropTypes.string,
}

// Magnifying glass with a + sign inside the lens — "zoom to feature"
export const IconZoomIn16 = () => (
    <svg
        height="16"
        viewBox="0 0 16 16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M6 1a5 5 0 013.871 8.164l4.483 4.482-.708.708L9.164 9.87A5 5 0 116 1zm0 1a4 4 0 100 8 4 4 0 000-8zM3.5 5.5L5.5 5.5 5.5 3.5 6.5 3.5 6.5 5.5 8.5 5.5 8.5 6.5 6.5 6.5 6.5 8.5 5.5 8.5 5.5 6.5 3.5 6.5Z"
            fill="currentColor"
        />
    </svg>
)

export const IconDrag = () => (
    <svg
        height="8"
        viewBox="0 0 15 8"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m1.5 5c.82842712 0 1.5.67157288 1.5 1.5s-.67157288 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.67157288-1.5 1.5-1.5zm6 0c.82842712 0 1.5.67157288 1.5 1.5s-.67157288 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.67157288-1.5 1.5-1.5zm6 0c.8284271 0 1.5.67157288 1.5 1.5s-.6715729 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.6715729-1.5 1.5-1.5zm-6-5c.82842712 0 1.5.67157288 1.5 1.5s-.67157288 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.67157288-1.5 1.5-1.5zm-6 0c.82842712 0 1.5.67157288 1.5 1.5s-.67157288 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.67157288-1.5 1.5-1.5zm12 0c.8284271 0 1.5.67157288 1.5 1.5s-.6715729 1.5-1.5 1.5-1.5-.67157288-1.5-1.5.6715729-1.5 1.5-1.5z"
            fill="#6e7a8a"
            fillRule="evenodd"
        />
    </svg>
)
