import i18n from '@dhis2/d2-i18n';
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
                    popup: this.onEventClick,
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

        this.layer.on('click', this.onEntityClick);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(layerBounds);
        }
    }

    // Remove layer instance (both facilities and areas)
    removeLayer() {
        const map = this.context.map;

        this.layer.off('click', this.onEventClick);

        if (map.hasLayer(this.areaInstance)) {
            map.removeLayer(this.areaInstance);
        }
        super.removeLayer();
    }

    onEntityClick = async (evt) => {
        const feature = evt.layer.feature; 
        const data = await apiFetch(`/trackedEntityInstances/${feature.id}?fields=attributes[displayName~rename(name),value]`);
        const content = data.attributes.map(({ name, value }) => `<tr><th>${name}:</th><td>${value}</td></tr>`).join('');

        L.popup()
          .setLatLng(evt.latlng)
          .setContent(`<table>${content}</table>`)
          .openOn(this.context.map);
    }
}

export default TrackedEntityLayer;
