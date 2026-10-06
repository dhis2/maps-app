import i18n from '@dhis2/d2-i18n'
import { IconView24, IconViewOff24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { isLayerAlert } from '../../util/layerAlerts.js'
import { getRenderingLabel } from '../../util/legend.js'
import LayerAlerts from '../legend/LayerAlerts.jsx'
import LayerLegend from '../legend/Legend.jsx'
import LegendAlert from '../legend/LegendAlert.jsx'

const DEFAULT_NO_ALERTS = []

// Shown between the title and the legend, like in the app layer card
const LegendLayerAlerts = ({ alerts, name, layerType }) => (
    <>
        <LayerAlerts alerts={alerts} layerName={name} layerType={layerType} />
        {/* LEGACY-ALERTS: remove when every loader returns layer alerts */}
        {alerts
            .filter((alert) => !isLayerAlert(alert))
            .map((alert, index) => (
                <div key={index} className="dhis2-map-legend-alert">
                    <LegendAlert alert={alert} />
                </div>
            ))}
    </>
)

LegendLayerAlerts.propTypes = {
    alerts: PropTypes.array.isRequired,
    layerType: PropTypes.string,
    name: PropTypes.string,
}

// Renders a legend with alerts for one map layer
const LegendLayer = ({
    id,
    name,
    layer: layerType,
    legend,
    renderingStrategy,
    alerts = DEFAULT_NO_ALERTS,
    isVisible = true,
    toggleLayerVisibility,
}) => (
    <div key={id}>
        {!legend && alerts.length > 0 && (
            <h2 className="dhis2-map-legend-title">
                <span className="dhis2-map-legend-title-text">{name}</span>
            </h2>
        )}
        {!legend && (
            <LegendLayerAlerts
                alerts={alerts}
                name={name}
                layerType={layerType}
            />
        )}
        {legend && (
            <Fragment>
                <h2 className="dhis2-map-legend-title">
                    <span className="dhis2-map-legend-title-text">
                        {legend.title}
                        <span className="dhis2-map-legend-period">
                            {legend.period}
                            {getRenderingLabel(renderingStrategy)}
                        </span>
                    </span>
                    {toggleLayerVisibility && (
                        <button
                            className="dhis2-map-legend-visibility-btn"
                            title={
                                isVisible
                                    ? i18n.t('Hide layer')
                                    : i18n.t('Show layer')
                            }
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleLayerVisibility(id)
                            }}
                        >
                            {isVisible ? <IconView24 /> : <IconViewOff24 />}
                        </button>
                    )}
                </h2>
                <LegendLayerAlerts
                    alerts={alerts}
                    name={name}
                    layerType={layerType}
                />
                <LayerLegend isPlugin={true} {...legend} />
            </Fragment>
        )}
    </div>
)

LegendLayer.propTypes = {
    id: PropTypes.string.isRequired,
    alerts: PropTypes.array,
    data: PropTypes.array,
    isVisible: PropTypes.bool,
    layer: PropTypes.string,
    legend: PropTypes.object,
    name: PropTypes.string,
    renderingStrategy: PropTypes.string,
    serverCluster: PropTypes.bool,
    toggleLayerVisibility: PropTypes.func,
}

export default LegendLayer
