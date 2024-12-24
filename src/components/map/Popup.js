import PropTypes from 'prop-types'
import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import useKeyDown from '../../hooks/useKeyDown.js'
import OrgUnitButton from '../orgunits/OrgUnitButton.js'
import './styles/Popup.css'

const Popup = (props, context) => {
    const { className = '', coordinates, orgUnitId, onClose, children } = props
    const { map, isPlugin } = context
    const container = useMemo(() => document.createElement('div'), [])

    useKeyDown('Escape', () => map.closePopup())

    // Create and open popup on map
    useEffect(() => {
        container.className = className
        map.openPopup(container, coordinates, onClose)
    }, [map, container, className, coordinates, onClose])

    // Close popup if component is unmounted
    useEffect(() => {
        return () => map.closePopup()
    }, [map])

    return createPortal(
        <>
            {children}
            {isPlugin === false && orgUnitId && (
                <OrgUnitButton id={orgUnitId} />
            )}
        </>,
        container
    )
}

Popup.contextTypes = {
    map: PropTypes.object,
    isPlugin: PropTypes.bool,
}

Popup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default Popup
