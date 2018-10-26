import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Legend from '../layers/legend/Legend';

const styles = {
    root: {
        // background: 'red',
    },
    legend: {
        // background: '#eee',
    },
    title: {
        fontSize: 15,
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        paddingLeft: 10,
        marginTop: 5,
    },
    period: {
        display: 'block',
        fontWeight: 'normal',
    },
};

class MapLegend extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        position: PropTypes.string.isRequired,
        classes: PropTypes.object.isRequired,
    };

    componentDidMount() {
        this.addLegend();
        this.setLegendContent();
    }

    componentWillUnmount() {
        this.removeLegend();
    }

    componentDidUpdate(prevProps) {
        const { position } = this.props;

        if (position !== prevProps.position && this.legend) {
            this.legend.setPosition(position);
        }
    }

    render() {
        const { classes, layers } = this.props;
        const legends = layers
            .filter(layer => layer.legend)
            .map(layer => layer.legend);

        return (
            <div ref={el => (this.container = el)} style={{ display: 'none' }}>
                <div className={classes.root}>
                    {legends.map((legend, index) => (
                        <div key={index} className={classes.legend}>
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
            </div>
        );
    }

    addLegend() {
        const { position } = this.props;
        const { map } = this.context;

        this.legend = map.addControl({
            type: 'legend',
            position,
            collapsed: false,
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

export default withStyles(styles)(MapLegend);
