import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import i18n from '@dhis2/d2-i18n';
import Legend from '../../layers/legend/Legend';

const styles = theme => ({
    title: {
        margin: 0,
        fontSize: 14,
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        lineHeight: '16px',
        paddingBottom: theme.spacing.unit,
    },
    period: {
        display: 'block',
        fontWeight: 'normal',
    },
    nodata: {
        fontStyle: 'italic',
    },
});

class PluginLegend extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        layers: PropTypes.array.isRequired,
        classes: PropTypes.object.isRequired,
    };

    // Add Leaflet legend control on mount
    componentDidMount() {
        this.legend = this.context.map.addControl({
            type: 'legend',
            offset: [0, -64],
        });

        this.setLegendContent();
    }

    // Legend can change when user is drilling down
    componentDidUpdate() {
        this.setLegendContent();
    }

    // Remove Leaflet legend control on unmount
    componentWillUnmount() {
        if (this.legend) {
            this.legend.remove();
        }
    }

    // Contents is rendered to a hidden div
    render() {
        const { layers, classes } = this.props;
        const legendLayers = layers.filter(layer => layer.legend);

        return (
            <div ref={el => (this.container = el)} style={{ display: 'none' }}>
                {legendLayers.map(({ id, legend, serverCluster, data }) => {
                    const hasData =
                        (Array.isArray(data) && data.length > 0) ||
                        serverCluster;

                    return (
                        <div key={id}>
                            <h2 className={classes.title}>
                                {legend.title}{' '}
                                <span className={classes.period}>
                                    {legend.period}
                                </span>
                            </h2>
                            {hasData ? (
                                <Legend {...legend} />
                            ) : (
                                <div className={classes.nodata}>
                                    {i18n.t('No data found')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Add contents from render function to Leaflet legend control (not react)
    setLegendContent() {
        this.legend.setContent(this.container.cloneNode(true).innerHTML);
    }
}

export default withStyles(styles)(PluginLegend);
