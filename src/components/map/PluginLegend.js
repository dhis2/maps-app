import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Legend from '../layers/legend/Legend';

const styles = {
    title: {
        fontSize: 14,
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        paddingLeft: 10,
        marginTop: 5,
    },
    period: {
        display: 'block',
        fontWeight: 'normal',
    },
};

class PluginLegend extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        layers: PropTypes.array.isRequired,
        classes: PropTypes.object.isRequired,
    };

    componentDidMount() {
        this.addLegend();
        this.setLegendContent();
    }

    componentWillUnmount() {
        this.removeLegend();
    }

    render() {
        const { layers, classes } = this.props;

        const legends = layers
            .filter(layer => layer.legend)
            .map(layer => layer.legend);

        // TODO: Add alerts
        return (
            <div ref={el => (this.container = el)} style={{ display: 'none' }}>
                {legends.map((legend, index) => (
                    <div key={index}>
                        <h2 className={classes.title}>
                            {legend.title}{' '}
                            <span className={classes.period}>
                                {legend.period}
                            </span>
                        </h2>
                        <Legend {...legend} />
                    </div>
                ))}
            </div>
        );
    }

    addLegend() {
        const { map } = this.context;

        this.legend = map.addControl({
            type: 'legend',
            offset: [0, -64],
        });
    }

    removeLegend() {
        if (this.legend) {
            this.legend.remove();
        }
    }

    setLegendContent() {
        this.legend.setContent(this.container.cloneNode(true).innerHTML);
    }
}

export default withStyles(styles)(PluginLegend);
