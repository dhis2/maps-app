import Layer from './Layer';
import { apiFetch } from '../../util/api';

export default class EarthEngineLayer extends Layer {
    createLayer() {
        const props = this.props;
        const map = this.context.map;

        const config = {
            type: 'earthEngine',
            pane: props.id,
            id: props.datasetId,
            band: props.band,
            mask: props.mask,
            attribution: props.attribution,
            filter: props.filter,
            methods: props.methods,
            aggregation: props.aggregation,
        };

        if (props.params) {
            config.params = props.params;
        }

        config.accessToken = (callback) => {
            apiFetch('/tokens/google')
                .then(json => callback(json));
        };

        this.layer = map.createLayer(config);
    }
}