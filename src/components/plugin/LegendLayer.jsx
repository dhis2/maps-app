import i18n from '@dhis2/d2-i18n'
import { IconView24, IconViewOff24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { getRenderingLabel } from '../../util/legend.js'
import LayerLegend from '../legend/Legend.jsx'

const DEFAULT_NO_ALERTS = []

// Renders a legend with alerts for one map layer
const LegendLayer = ({
    id,
    legend,
    renderingStrategy,
    alerts = DEFAULT_NO_ALERTS,
    isVisible = true,
    toggleLayerVisibility,
}) => (
    <div key={id}>
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
                <LayerLegend isPlugin={true} {...legend} />
            </Fragment>
        )}
        {alerts.map((alert, index) => (
            <div key={index} className="dhis2-map-legend-alert">
                {alert.message}
            </div>
        ))}
    </div>
)

LegendLayer.propTypes = {
    id: PropTypes.string.isRequired,
    alerts: PropTypes.array,
    data: PropTypes.array,
    isVisible: PropTypes.bool,
    layer: PropTypes.string,
    legend: PropTypes.object,
    renderingStrategy: PropTypes.string,
    serverCluster: PropTypes.bool,
    toggleLayerVisibility: PropTypes.func,
}

export default LegendLayer
