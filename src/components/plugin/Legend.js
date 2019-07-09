import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Legend from '../layers/legend/Legend';

const styles = theme => ({
    root: {
        position: 'absolute',
        right: 10,
        top: 74,
        zIndex: 999,
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.65)',
        backgroundColor: '#fff',
        fontSize: 14,
    },
    toggle: {
        width: 26,
        height: 26,
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '16px 16px',
        backgroundImage:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAy5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIEVsZW1lbnRzIDE0LjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0VDMTEyQzZDRTU4MTFFNTk1Q0ZGQzk2MTlGNkY2NjYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0VDMTEyQzdDRTU4MTFFNTk1Q0ZGQzk2MTlGNkY2NjYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QkJDODIwOUNFNTYxMUU1OTVDRkZDOTYxOUY2RjY2NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QkJDODIwQUNFNTYxMUU1OTVDRkZDOTYxOUY2RjY2NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjzimhsAAACgSURBVHjaYqxXZ/nPgAN8+A2WYgQRE+7+YaAFYGIYYMBCqgZGRsb/wyoEhl4U2FhbDawDjhw9xkhVB0Cz2sCFgAArI14fkepAmofAgCfCw0eODrNsmKX2D2ccPP/JBK8LRgui0bpgtC6gWV0AzWoDFwKS7P/w+ohUB9I8BEbrAqqHgK2PJc6S7ePnr6N1wWhdMFoX0L4ugGa1AQsBgAADAHQ1NZdoV4oTAAAAAElFTkSuQmCC")',
    },
    content: {
        overflowY: 'auto',
        minWidth: 150,
        maxWidth: 200,
        minHeight: 80,
        maxHeight: 260,
        padding: '6px 10px 6px 6px',
        color: '#333',
    },
    title: {
        margin: 0,
        fontSize: 14,
        lineHeight: '18px',
        paddingBottom: theme.spacing.unit,
    },
    period: {
        display: 'block',
        fontWeight: 'normal',
    },
    alert: {
        paddingBottom: 8,
    },
});

class PluginLegend extends PureComponent {
    static propTypes = {
        layers: PropTypes.array.isRequired,
        classes: PropTypes.object.isRequired,
    };

    state = {
        isOpen: false,
    };

    render() {
        const { layers, classes } = this.props;
        const { isOpen } = this.state;
        const legendLayers = layers
            .filter(layer => layer.legend || layer.alerts)
            .reverse(); // Show top layer first

        return (
            <div className={classes.root}>
                {isOpen ? (
                    <div
                        className={classes.content}
                        onMouseLeave={this.onMouseLeave}
                    >
                        {legendLayers.map(this.getLayerLegend)}
                    </div>
                ) : (
                    <div
                        className={classes.toggle}
                        title={i18n.t('Legend')}
                        onMouseEnter={this.onMouseEnter}
                    />
                )}
            </div>
        );
    }

    getLayerLegend = mapView => {
        const { id, layer, legend, serverCluster, data, alerts = [] } = mapView;
        const { classes } = this.props;
        const hasData =
            (Array.isArray(data) && data.length > 0) ||
            serverCluster ||
            layer === 'earthEngine';

        return (
            <div key={id}>
                {legend && (
                    <Fragment>
                        <h2 className={classes.title}>
                            {legend.title}{' '}
                            <span className={classes.period}>
                                {legend.period}
                            </span>
                        </h2>
                        {hasData && <Legend {...legend} />}
                    </Fragment>
                )}
                {alerts.map(alert => (
                    <div key={alert.id} className={classes.alert}>
                        {alert.description}
                    </div>
                ))}
            </div>
        );
    };

    onMouseEnter = () => this.setState({ isOpen: true });

    onMouseLeave = () => this.setState({ isOpen: false });
}

export default withStyles(styles)(PluginLegend);
