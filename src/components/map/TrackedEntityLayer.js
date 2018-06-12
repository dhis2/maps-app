import i18n from '@dhis2/d2-i18n';
import { getInstance as getD2 } from 'd2/lib/d2';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS, TEI_BUFFER } from '../../constants/layers';

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

        const color = eventPointColor || TEI_COLOR;

        // console.log('props', this.props, TEI_COLOR, TEI_RADIUS, TEI_BUFFER);

        console.log('##', color);

        const map = this.context.map;

        if (areaRadius) {
            console.log('areaRadius', areaRadius);
            map.createLayer({
                type: 'buffer', // 'boundary',
                pane: id,
                data,
                buffer: areaRadius, // meters
                style: {
                    color,
                    // color: 'green',
                    opacity: 0.2,
                    fillOpacity: 0.1,
                },
            }).addTo(map);
        }

        // Create and add event layer based on config object
        this.layer = map
            .createLayer({
                type: 'geoJson',
                pane: id,
                data,
                style: {
                    color,
                },
            })
            .addTo(map);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
    }
}

export default TrackedEntityLayer;
