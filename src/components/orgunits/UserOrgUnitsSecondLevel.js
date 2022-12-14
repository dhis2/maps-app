import PropTypes from 'prop-types'
import React from 'react'

const UserOrgUnitsSecondLevel = ({ style }) => (
    <svg
        width="45px"
        height="41px"
        viewBox="0 0 45 41"
        version="1.1"
        style={style}
    >
        <rect x="18.5" y="0.5" width="8" height="8" />
        <rect className="filled" x="30.5" y="16.5" width="8" height="8" />
        <rect className="filled" x="6.5" y="16.5" width="8" height="8" />
        <rect x="12.5" y="32.5" width="8" height="8" />
        <rect x="24.5" y="32.5" width="8" height="8" />
        <rect x="36.5" y="32.5" width="8" height="8" />
        <rect x="0.5" y="32.5" width="8" height="8" />
        <path d="M22.5,9.5 L22.5,12.5" />
        <path d="M10.5,25.5 L10.5,28.5" />
        <path d="M10.5,12.5 L10.5,15.5" />
        <path d="M34.5,12.5 L34.5,15.5" />
        <path d="M4.5,28.5 L4.5,31.5" />
        <path d="M40.5,29.5 L40.5,32.5" />
        <path d="M16.5,29.5 L16.5,32.5" />
        <path d="M28.5,29.5 L28.5,32.5" />
        <path d="M34.5,25.5 L34.5,28.5" />
        <path d="M10.5,12.5 L34.5,12.5" />
        <path d="M4.5,28.5 L16.5,28.5" />
        <path d="M28.5,28.5 L40.5,28.5" />
    </svg>
)

UserOrgUnitsSecondLevel.propTypes = {
    style: PropTypes.object,
}

export default UserOrgUnitsSecondLevel
