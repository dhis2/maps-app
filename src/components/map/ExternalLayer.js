import Layer from './Layer';
import isString from 'd2-utilizr/lib/isString';

export default class ExternalLayer extends Layer {
    createLayer() {
        const props = this.props;
        const config = props.config;
        const map = this.context.map;

        config.type = 'tileLayer'; // TODO: Should be part of config object
        config.pane = props.id;

        this.layer = map.createLayer(config);
    }
}