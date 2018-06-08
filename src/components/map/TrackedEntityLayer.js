import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import Layer from './Layer';

class TrackedEntityLayer extends Layer {
    createLayer(callback) {
        const {
            trackedEntityType,
        } = this.props;

        /*
        const config = {
            type: 'dots',
            pane: id,
            data,
            color: color || EVENT_COLOR,
            radius: eventPointRadius || EVENT_RADIUS,
            popup: this.onEventClick.bind(this),
        };

        // Create and add event layer based on config object
        this.layer = map.createLayer(config).addTo(map);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
        */

    }

}

export default TrackedEntityLayer;
