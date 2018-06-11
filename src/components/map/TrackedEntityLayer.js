import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS, TEI_BUFFER } from '../../constants/layers';

class TrackedEntityLayer extends Layer {
    createLayer(callback) {
        const { id, data, trackedEntityType } = this.props;

        console.log('props', this.props);

        const map = this.context.map;

        const config = {
            type: 'boundary',
            pane: id,
            data,
        };

        // Create and add event layer based on config object
        this.layer = map.createLayer(config).addTo(map);

        map.createLayer({
            type: 'buffer', // 'boundary',
            pane: id,
            data,
            buffer: 5000, // meters
        }).addTo(map);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
    }
}

export default TrackedEntityLayer;
