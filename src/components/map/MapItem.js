import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mapApi from './MapApi';
import styles from './styles/MapItem.module.css';

class MapItem extends PureComponent {
    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    static propTypes = {
        isPlugin: PropTypes.bool,
        resizeOptions: PropTypes.object,
        index: PropTypes.number.isRequired,
        count: PropTypes.number.isRequired,
        layerId: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        setMapControls: PropTypes.func.isRequired,
    };

    state = {};

    constructor(props, context) {
        super(props, context);

        const { isPlugin = false } = props;

        this.map = mapApi({
            attributionControl: false,
            scrollZoom: !isPlugin,
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
        const { count, resizeOptions } = this.props;

        if (count !== prevProps.count) {
            this.fitLayerBounds();
        }

        if (resizeOptions !== prevProps.resizeOptions) {
            this.onFullScreenChange(resizeOptions);
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
        const { count, children } = this.props;
        const { map } = this.state;

        return (
            <div
                ref={node => (this.node = node)}
                className={styles.mapItem}
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

    onFullScreenChange = (options = {}) => {
        const { scrollZoom, fitBounds } = options;

        this.map.resize();

        if (scrollZoom !== undefined) {
            this.map.toggleScrollZoom(scrollZoom);
        }

        if (fitBounds) {
            const bounds = this.map.getLayersBounds();

            if (Array.isArray(bounds)) {
                this.map.fitBounds(bounds);
            }
        }
    };
}

export default MapItem;
