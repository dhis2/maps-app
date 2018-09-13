import Layer from './Layer';

export default class ExternalLayer extends Layer {
    createLayer() {
        const props = this.props;
        const config = props.config;
        const map = this.context.map;

        config.pane = props.id;

        this.layer = map.createLayer(config);
    }
}
