import PropTypes from 'prop-types'
import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import OrgUnitButton from '../orgunits/OrgUnitButton.js'
import FeatureButton from './FeatureButton.js'
import './styles/Popup.css'

const Popup = (props, context) => {
    const {
        className = '',
        coordinates,
        orgUnitId,
        data,
        name,
        onClose,
        children,
    } = props
    const { map, isPlugin } = context
    const container = useMemo(() => document.createElement('div'), [])

    // Create and open popup on map
    useEffect(() => {
        container.className = className
        map.openPopup(container, coordinates, onClose)
    }, [map, container, className, coordinates, onClose])

    // Close popup if component is unmounted
    useEffect(() => {
        return () => map.closePopup()
    }, [map])

    const getButton = () => {
        if (isPlugin) {
            return null
        }
        if (orgUnitId) {
            return <OrgUnitButton id={orgUnitId} />
        }
        if (data) {
            return <FeatureButton name={name} data={data} />
        }
    }

    return createPortal(
        <>
            {children}
            {getButton()}
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
    data: PropTypes.array,
    name: PropTypes.string,
    orgUnitId: PropTypes.string,
}

export default Popup
