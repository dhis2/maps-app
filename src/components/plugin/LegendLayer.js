import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import LayerLegend from '../layers/legend/Legend';

// Renders a legend with alerts for one map layer
const LegendLayer = props => {
    const { id, layer, legend, serverCluster, data, alerts = [] } = props;

    const hasData =
        (Array.isArray(data) && data.length > 0) ||
        serverCluster ||
        layer === 'earthEngine';

    return (
        <div key={id}>
            {legend && (
                <Fragment>
                    <h2 className="dhis2-map-legend-title">
                        {legend.title}
                        <span className="dhis2-map-legend-period">
                            {legend.period}
                        </span>
                    </h2>
                    {hasData && <LayerLegend {...legend} />}
                </Fragment>
            )}
            {alerts.map(alert => (
                <div key={alert.id} className="dhis2-map-legend-alert">
                    {alert.description}
                </div>
            ))}
        </div>
    );
};

LegendLayer.propTypes = {
    id: PropTypes.string.isRequired,
    layer: PropTypes.string,
    legend: PropTypes.object,
    serverCluster: PropTypes.bool,
    data: PropTypes.array,
    alerts: PropTypes.array,
};

export default LegendLayer;
