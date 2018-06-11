import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS, TEI_BUFFER } from '../../constants/layers';

class TrackedEntityLayer extends Layer {
    createLayer(callback) {
        const { id, data, trackedEntityType, areaRadius } = this.props;

        const map = this.context.map;

        const config = {
            type: 'geoJson',
            pane: id,
            data,
        };

        // Create and add event layer based on config object
        this.layer = map.createLayer(config).addTo(map);

        if (areaRadius) {
            console.log('areaRadius', areaRadius);
            map.createLayer({
                type: 'buffer', // 'boundary',
                pane: id,
                data,
                buffer: areaRadius, // meters
            }).addTo(map);
        }
        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
    }
}

export default TrackedEntityLayer;
