import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import LayerLegend from '../legend/Legend';

// Renders a legend with alerts for one map layer
const LegendLayer = ({ id, legend, alerts = [] }) => (
    <div key={id}>
        {legend && (
            <Fragment>
                <h2 className="dhis2-map-legend-title">
                    {legend.title}
                    <span className="dhis2-map-legend-period">
                        {legend.period}
                    </span>
                </h2>
                <LayerLegend {...legend} />
            </Fragment>
        )}
        {alerts.map((alert, index) => (
            <div key={index} className="dhis2-map-legend-alert">
                {alert.message}
            </div>
        ))}
    </div>
);

LegendLayer.propTypes = {
    id: PropTypes.string.isRequired,
    layer: PropTypes.string,
    legend: PropTypes.object,
    serverCluster: PropTypes.bool,
    data: PropTypes.array,
    alerts: PropTypes.array,
};

export default LegendLayer;
