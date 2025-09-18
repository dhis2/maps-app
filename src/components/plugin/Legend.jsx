import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import LegendLayer from './LegendLayer.jsx'
import './styles/Legend.css'

// Renders a legend for all map layers
const Legend = ({ layers }) => {
    const [isOpen, toggleOpen] = useState(false)

    const legendLayers = layers
        .filter((layer) => layer.legend || layer.alerts)
        .reverse() // Show top layer first

    return (
        <div className="dhis2-map-legend">
            {isOpen ? (
                <div
                    className="dhis2-map-legend-content"
                    onMouseLeave={() => toggleOpen(false)}
                >
                    {legendLayers.map((layer) => (
                        <LegendLayer key={layer.id} {...layer} />
                    ))}
                </div>
            ) : (
                <div
                    className="dhis2-map-legend-button"
                    title={i18n.t('Legend')}
                    onMouseEnter={() => toggleOpen(true)}
                />
            )}
        </div>
    )
}

Legend.propTypes = {
    layers: PropTypes.array.isRequired,
}

export default Legend
