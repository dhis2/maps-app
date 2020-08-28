import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import mapApi from './MapApi';

const styles = () => ({
    item: {
        position: 'relative',
        boxSizing: 'border-box',
        borderRight: '1px solid #aaa',
        borderBottom: '1px solid #aaa',
    },
});

class MapItem extends PureComponent {
    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    static propTypes = {
        index: PropTypes.number.isRequired,
        count: PropTypes.number.isRequired,
        layerId: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        classes: PropTypes.object.isRequired,
        setMapControls: PropTypes.func.isRequired,
    };

    state = {};

    constructor(props, context) {
        super(props, context);
        this.map = mapApi({
            attributionControl: false,
        });

        this.map.on('ready', this.onMapReady);
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        const { layerId, index, setMapControls } = this.props;
        const { map } = this;

        this.node.appendChild(map.getContainer());
        this.fitLayerBounds();

        map.sync(layerId);

        // Add map controls if first map
        if (index == 0) {
            setMapControls(map);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.count !== prevProps.count) {
            this.fitLayerBounds();
        }
        this.map.resize();
    }

    componentWillUnmount() {
        this.map.off('ready', this.onMapReady);
        this.map.unsync(this.props.layerId);
        this.map.remove();
        delete this.map;
    }

    render() {
        const { count, children, classes } = this.props;
        const { map } = this.state;

        return (
            <div
                ref={node => (this.node = node)}
                className={classes.item}
                style={{
                    width: count === 4 ? '50%' : '33.3333%',
                }}
            >
                {map && children}
            </div>
        );
    }

    // Zoom to layers bounds on mount
    fitLayerBounds() {
        this.map.resize();

        const bounds = this.map.getLayersBounds();
        if (bounds) {
            this.map.fitBounds(bounds);
        } else {
            this.map.fitWorld();
        }
    }

    onMapReady = map => this.setState({ map });
}

export default withStyles(styles)(MapItem);
