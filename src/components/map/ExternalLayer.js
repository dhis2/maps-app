import Layer from './Layer';

export default class ExternalLayer extends Layer {
    createLayer() {
        const props = this.props;
        const config = props.config;
        const map = this.context.map;

        config.id = props.id;
        config.index = props.index;

        this.layer = map.createLayer(config);
    }
}
