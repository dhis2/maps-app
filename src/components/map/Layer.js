import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Layer extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
    };

    static propTypes = {
        areaRadius: PropTypes.number,
        data: PropTypes.array,
        dataFilters: PropTypes.object,
        id: PropTypes.string.isRequired,
        index: PropTypes.number,
        layer: PropTypes.string,
        editCounter: PropTypes.number,
        opacity: PropTypes.number,
        isVisible: PropTypes.bool,
        config: PropTypes.object,
        labels: PropTypes.bool,
        openContextMenu: PropTypes.func,
        renderingStrategy: PropTypes.string,
    };

    static defaultProps = {
        opacity: 1,
        isVisible: true,
    };

    constructor(...args) {
        super(...args);
        this.setPeriod();
        this.createLayer();
    }

    componentDidUpdate(prevProps, prevState = {}) {
        const {
            id,
            data,
            index,
            opacity,
            isVisible,
            editCounter,
            dataFilters,
        } = this.props;
        const { period } = this.state || {};
        const { period: prevPeriod } = prevState || {};
        const isEdited = editCounter !== prevProps.editCounter;

        // Create new map if new id of editCounter is increased
        if (
            id !== prevProps.id ||
            data !== prevProps.data ||
            period !== prevPeriod ||
            dataFilters !== prevProps.dataFilters ||
            isEdited
        ) {
            // Reset period if edited
            if (isEdited) {
                this.setPeriod(this.updateLayer);
            } else {
                this.updateLayer();
            }
        }

        if (index !== undefined && index !== prevProps.index) {
            this.setLayerOrder();
        }

        if (opacity !== prevProps.opacity) {
            this.setLayerOpacity();
        }

        if (isVisible !== prevProps.isVisible) {
            this.setLayerVisibility();
        }
    }

    componentWillUnmount() {
        this.removeLayer();
    }

    // Create new layer from config object (override in subclasses)
    createLayer() {
        const { id, index = 0, config, opacity, isVisible } = this.props;
        const { map } = this.context;

        this.layer = map.createLayer({
            ...config,
            id,
            index,
            opacity,
            isVisible,
        });

        map.addLayer(this.layer);
    }

    updateLayer = () => {
        this.removeLayer();
        this.createLayer();
        this.setLayerOrder();
    };

    // Override in subclass if needed
    setPeriod(callback) {
        if (callback) {
            callback();
        }
    }

    setLayerVisibility() {
        this.layer.setVisibility(this.props.isVisible);
    }

    setLayerOpacity() {
        this.layer.setOpacity(this.props.opacity);
    }

    setLayerOrder() {
        this.layer.setIndex(this.props.index);
    }

    // Fit map to layer bounds
    fitBounds() {
        const { map } = this.context;

        if (this.layer.getBounds) {
            map.fitBounds(this.layer.getBounds());
        }
    }

    // Fit map to layer bounds once (when first created)
    fitBoundsOnce() {
        if (!this.isZoomed || this.context.map.getZoom() === undefined) {
            this.fitBounds();
            this.isZoomed = true;
        }
    }

    removeLayer() {
        const map = this.context.map;

        this.layer.off('contextmenu', this.onFeatureRightClick, this);

        if (map.hasLayer(this.layer)) {
            map.removeLayer(this.layer);
        }

        delete this.layer;
    }

    render() {
        return null;
    }

    onFeatureRightClick(evt) {
        const [x, y] = evt.position;
        const { id, layer, renderingStrategy } = this.props;
        const { map } = this.context;
        const container = map.getContainer();
        const { left, top } = container.getBoundingClientRect();
        const isSplitView = renderingStrategy === 'SPLIT_BY_PERIOD';

        this.props.openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
            layerId: id,
            layerType: layer,
            isSplitView,
            container: isSplitView
                ? container.parentNode.parentNode
                : container,
        });
    }

    // Called when a map popup is closed
    onPopupClose = popup => {
        // Added check to avoid closing a new popup
        if (!popup || this.state.popup === popup) {
            this.setState({ popup: null });
        }
    };
}

export default Layer;
