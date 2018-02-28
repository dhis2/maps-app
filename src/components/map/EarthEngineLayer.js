import Layer from './Layer';
import { apiFetch } from '../../util/api';

export default class EarthEngineLayer extends Layer {
    componentDidUpdate(prev) {
        super.componentDidUpdate(prev);

        const { coordinate } = this.props;

        if (coordinate && (coordinate !== prev.coordinate)) {
            this.layer.showValue({
                lng: coordinate[0],
                lat: coordinate[1],
            });
        }
    }

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
            name: props.name,
            unit: props.legend.unit,
            value: props.value,
            legend: props.legend && !props.legend.unit ? props.legend.items : null,
            resolution: props.resolution,
            projection: props.projection,
        };

        if (props.params) {
            config.params = props.params;
        }

        if (props.popup) {
            config.popup = props.popup;
        }

        config.accessToken = (callback) => {
            apiFetch('/tokens/google')
                .then(json => callback(json));
        };

        this.layer = map.createLayer(config);
    }
}