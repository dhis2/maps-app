import Layer from './Layer';
import { FLOW_LAYER } from '../../../constants/layers';

class FlowLayer extends Layer {
    createLayer() {
        const { map } = this.context;

        const config = {
            type: FLOW_LAYER,
        };

        this.layer = map.createLayer(config);
        map.addLayer(this.layer);
    }
}

export default FlowLayer;
