import Layer from './Layer';

export default class ExternalLayer extends Layer {
    createLayer() {
        const { id, index, opacity, isVisible, config } = this.props;
        const { map } = this.context;

        this.layer = map.createLayer({
            id,
            index,
            opacity,
            isVisible,
            ...config,
        });

        map.addLayer(this.layer);
    }
}
