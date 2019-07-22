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

    updateLayer() {
        this.removeLayer();
        this.createLayer();
        this.setLayerOrder();
    }

    // Override in subclass if needed
    setPeriod() {}

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

    removeLayer() {
        const map = this.context.map;

        if (map.hasLayer(this.layer)) {
            map.removeLayer(this.layer);
        }

        delete this.layer;
    }

    render() {
        return null;
    }
}

export default Layer;
