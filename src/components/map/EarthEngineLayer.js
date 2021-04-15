import Layer from './Layer';
import { apiFetch } from '../../util/api';

export default class EarthEngineLayer extends Layer {
    componentDidUpdate(prev) {
        super.componentDidUpdate(prev);

        const { coordinate } = this.props;

        if (coordinate && coordinate !== prev.coordinate) {
            try {
                this.layer.showValue({
                    lng: coordinate[0],
                    lat: coordinate[1],
                });
            } catch (err) {
                // eslint-disable-next-line
                console.error(
                    'Google Earth Engine failed. Is the service configured for this DHIS2 instance?'
                );
            }
        }
    }

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            datasetId,
            band,
            mask,
            attribution,
            filter,
            methods,
            aggregation,
            name,
            legend,
            value,
            resolution,
            projection,
            params,
            popup,
        } = this.props;

        const { map } = this.context;
        const mosaic = aggregation === 'mosaic';

        const config = {
            type: 'earthEngine',
            id,
            index,
            opacity,
            isVisible,
            datasetId,
            band,
            mask,
            attribution,
            filter,
            methods,
            mosaic,
            name,
            unit: legend.unit,
            value: value,
            legend: legend ? legend.items : null,
            resolution,
            projection,
        };

        if (params) {
            config.params = params;
        }

        if (popup) {
            config.popup = popup;
        }

        config.accessToken = apiFetch('/tokens/google'); // returns promise

        this.layer = map.createLayer(config);
        map.addLayer(this.layer);
    }
}
