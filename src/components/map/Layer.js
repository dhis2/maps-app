import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Layer extends PureComponent {

    static contextTypes = {
        map: PropTypes.object,
        d2: PropTypes.object,
    };

    static propTypes = {
        id: PropTypes.string.isRequired,
        index: PropTypes.number,
        editCounter: PropTypes.number,
        opacity: PropTypes.number,
        isVisible: PropTypes.bool,
        config: PropTypes.object,
        // labels: PropTypes.object, // TODO: Is sometimes boolean
    };

    static defaultProps = {
        opacity: 1,
        isVisible: true,
    };

    // Create pane and layer
    componentWillMount() {
        this.createPane();
        this.createLayer();
    }

    componentDidMount() {
        const map = this.context.map;
        map.addLayer(this.layer);
        this.onLayerAdd();
    }

    componentDidUpdate(prev) {
        const { id, index, opacity, isVisible, editCounter, data } = this.props;
        const map = this.context.map;

        // Create new map if new id of editCounter is increased
        if (id !== prev.id || editCounter !== prev.editCounter) {
            this.removeLayer();
            this.createLayer();
            map.addLayer(this.layer);
            this.onLayerAdd();
        }

        if (index !== undefined && index !== prev.index) {
            this.setLayerOrder();
        }

        if (opacity !== prev.opacity) {
            this.setLayerOpacity();
        }

        if (isVisible !== prev.isVisible) {
            this.setLayerVisibility();
        }
    }

    componentWillUnmount() {
        this.removeLayer();
    }

    // Create custom pane to control layer ordering: http://leafletjs.com/examples/map-panes/
    createPane() {
        const { id, labels } = this.props;
        const map = this.context.map;

        this.pane = map.createPane(id);

        if (labels) {
            this.labelPane = map.createPane(`${id}-labels`);
        }
    }

    // Create new layer from config object (override in subclasses)
    createLayer() {
        // console.log('createLayer');

        const { id, index, config } = this.props;
        const map = this.context.map;
        const layerConfig = {
            ...config,
        };

        if (index !== undefined) { // If not a basemap
            layerConfig.pane = id;
        }

        // console.log('layerConfig', layerConfig);


        this.layer = map.createLayer(layerConfig);
    }

    onLayerAdd() {
        // console.log('onLayerAdd');

        this.setLayerOpacity();
        this.setLayerVisibility();

        if (this.props.index !== undefined) { // Basemap don't have index
            this.setLayerOrder();
        }
    }

    setLayerOpacity() {
        this.layer.setOpacity(this.props.opacity);
    }

    // Set layer order using custom panes and z-index: http://leafletjs.com/examples/map-panes/
    setLayerOrder() {
        const { index } = this.props;
        const zIndex = 600 - (index * 10);

        if (this.pane) { // TODO: Needed?
            this.pane.style.zIndex = zIndex;
        }

        if (this.labelPane) {
            this.labelPane.style.zIndex = zIndex + 1;
        }
    }

    setLayerVisibility() {
        const isVisible = this.props.isVisible;
        const map = this.context.map;
        const layer = this.layer;

        if (isVisible && map.hasLayer(layer) === false) {
            map.addLayer(layer);
        } else if (!isVisible && map.hasLayer(layer) === true) {
            map.removeLayer(layer);
        }
    }

    removeLayer() {
        const layer = this.layer;
        const map = this.context.map;

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }

        delete(this.layer);
        delete(this.pane);
        delete(this.labelPane);
    }

    render() {
        return null;
    }
}

export default Layer;
