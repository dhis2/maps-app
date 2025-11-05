import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import LegendLayer from './LegendLayer.jsx'
import './styles/Legend.css'

// Renders a legend for all map layers
const Legend = ({ layers }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPinned, setIsPinned] = useState(false)

    const legendLayers = layers
        .filter((layer) => layer.legend || layer.alerts)
        .reverse() // Show top layer first

    return (
        <div className={cx('dhis2-map-legend', { pinned: isPinned })}>
            {isOpen ? (
                <div
                    title={
                        isPinned
                            ? i18n.t('Click to unpin legend')
                            : i18n.t('Click to pin legend')
                    }
                >
                    <div
                        className="dhis2-map-legend-content"
                        onMouseLeave={() => !isPinned && setIsOpen(false)}
                        onClick={() => setIsPinned(!isPinned)}
                    >
                        {legendLayers.map((layer) => (
                            <LegendLayer key={layer.id} {...layer} />
                        ))}
                    </div>
                </div>
            ) : (
                <div
                    className="dhis2-map-legend-button"
                    title={i18n.t('Legend')}
                    onMouseEnter={() => setIsOpen(true)}
                />
            )}
        </div>
    )
}

Legend.propTypes = {
    layers: PropTypes.array.isRequired,
}

export default Legend
