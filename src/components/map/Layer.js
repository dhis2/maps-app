import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Layer extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
        d2: PropTypes.object,
    };

    static propTypes = {
        areaRadius: PropTypes.number,
        data: PropTypes.array,
        dataFilters: PropTypes.array,
        id: PropTypes.string.isRequired,
        index: PropTypes.number,
        editCounter: PropTypes.number,
        opacity: PropTypes.number,
        isVisible: PropTypes.bool,
        config: PropTypes.object,
        labels: PropTypes.bool,
    };

    static defaultProps = {
        opacity: 1,
        isVisible: true,
    };

    constructor(...args) {
        super(...args);

        this.createLayer();
    }

    componentDidMount() {
        const map = this.context.map;
        map.addLayer(this.layer);
        this.onLayerAdd();
    }

    componentDidUpdate(prev) {
        const {
            id,
            data,
            index,
            opacity,
            isVisible,
            editCounter,
            dataFilters,
        } = this.props;
        const map = this.context.map;

        // Create new map if new id of editCounter is increased
        if (
            id !== prev.id ||
            data !== prev.data ||
            editCounter !== prev.editCounter ||
            dataFilters !== prev.dataFilters
        ) {
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

    // Create new layer from config object (override in subclasses)
    createLayer() {
        const { id, index = 0, config } = this.props;

        this.layer = this.context.map.createLayer({
            ...config,
            id,
            index,
        });
    }

    onLayerAdd() {
        this.setLayerOpacity();
        this.setLayerVisibility();
    }

    setLayerOpacity() {
        this.layer.setOpacity(this.props.opacity);
    }

    setLayerOrder() {
        this.layer.setIndex(this.props.index);
    }

    setLayerVisibility() {
        this.layer.setVisibility(this.props.isVisible);
    }

    // Fit map to layer bounds
    fitBounds() {
        this.context.map.fitBounds(this.layer.getBounds());
    }

    removeLayer() {
        const map = this.context.map;

        if (map.hasLayer(this.layer)) {
            map.removeLayer(this.layer);
        }

        if (map.hasLayer(this.buffers)) {
            map.removeLayer(this.buffers);
        }

        delete this.layer;
    }

    render() {
        return null;
    }
}

export default Layer;
