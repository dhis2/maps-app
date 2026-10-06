import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { ALERT_SEVERITY } from '../../constants/layerAlerts.js'
import { getMostSevereAlert } from '../../util/layerAlerts.js'
import { ALERT_ICONS } from '../legend/LayerAlerts.jsx'
import LegendLayer from './LegendLayer.jsx'
import './styles/Legend.css'

// Shown on the closed legend, as alerts are only visible when it is open
const BADGE_SEVERITIES = [ALERT_SEVERITY.ERROR, ALERT_SEVERITY.WARNING]

const getBadgeTitle = (severity) =>
    severity === ALERT_SEVERITY.ERROR
        ? i18n.t('Legend (a layer has an error)')
        : i18n.t('Legend (a layer has a warning)')

// Renders a legend for all map layers
const Legend = ({ layers, toggleLayerVisibility, isFullscreen }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPinned, setIsPinned] = useState(false)

    useEffect(() => {
        if (isFullscreen) {
            setIsOpen(true)
            setIsPinned(true)
        } else {
            setIsOpen(false)
            setIsPinned(false)
        }
    }, [isFullscreen])

    const badgeSeverity = getMostSevereAlert(layers)?.severity
    const hasBadge = BADGE_SEVERITIES.includes(badgeSeverity)

    const legendLayers = layers
        .filter((layer) => layer.legend || layer.alerts?.length)
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
                            <LegendLayer
                                key={layer.id}
                                {...layer}
                                toggleLayerVisibility={toggleLayerVisibility}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div
                    className="dhis2-map-legend-button"
                    title={
                        hasBadge
                            ? getBadgeTitle(badgeSeverity)
                            : i18n.t('Legend')
                    }
                    onMouseEnter={() => setIsOpen(true)}
                >
                    {hasBadge && (
                        <span
                            className={cx(
                                'dhis2-map-legend-badge',
                                badgeSeverity
                            )}
                            data-test={`legend-badge-${badgeSeverity}`}
                        >
                            {ALERT_ICONS[badgeSeverity]}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

Legend.propTypes = {
    layers: PropTypes.array.isRequired,
    isFullscreen: PropTypes.bool,
    toggleLayerVisibility: PropTypes.func,
}

export default Legend
