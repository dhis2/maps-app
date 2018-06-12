import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS } from '../../constants/layers';

class TrackedEntityLayer extends Layer {
    createLayer(callback) {
        const {
            id,
            data,
            trackedEntityType,
            eventPointColor,
            eventPointRadius,
            areaRadius,
        } = this.props;

        const map = this.context.map;
        const color = eventPointColor || TEI_COLOR;
        const radius = eventPointRadius || TEI_RADIUS;

        if (areaRadius) {
            this.areaInstance = map
                .createLayer({
                    type: 'buffer',
                    pane: id,
                    data,
                    buffer: areaRadius,
                    style: {
                        color,
                        weight: 1,
                        opacity: 0.2,
                        fillOpacity: 0.1,
                    },
                })
                .addTo(map);
        }

        this.layer = map
            .createLayer({
                type: 'geoJson',
                pane: id,
                data,
                style: {
                    color,
                    weight: 1,
                    radius,
                },
            })
            .addTo(map);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
    }

    // Remove layer instance (both facilities and areas)
    removeLayer() {
        const map = this.context.map;

        if (map.hasLayer(this.areaInstance)) {
            map.removeLayer(this.areaInstance);
        }
        super.removeLayer();
    }
}

export default TrackedEntityLayer;
