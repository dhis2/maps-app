import i18n from '@dhis2/d2-i18n';
import { apiFetch } from '../../util/api';
import Layer from './Layer';
import { TEI_COLOR, TEI_RADIUS } from '../../constants/layers';

class TrackedEntityLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
            data,
            eventPointColor,
            eventPointRadius,
            areaRadius,
            editCounter,
        } = this.props;

        const { map } = this.context;
        const color = eventPointColor || TEI_COLOR;
        const radius = eventPointRadius || TEI_RADIUS;

        const config = {
            type: 'geoJson',
            id,
            index,
            data,
            style: {
                color,
                weight: 1,
                radius,
            },
            onClick: this.onEntityClick.bind(this),
        };

        if (areaRadius) {
            config.buffer = areaRadius;
            config.bufferStyle = {
                color,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1,
            };
        }

        // Create and add layer based on config object
        this.layer = map.createLayer(config);
        map.addLayer(this.layer);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    // Remove layer instance (both facilities and areas)
    removeLayer() {
        this.layer.off('click', this.onEventClick);
        super.removeLayer();
    }

    onEntityClick = async ({ feature, coordinates }) => {
        const data = await apiFetch(
            `/trackedEntityInstances/${
                feature.id
            }?fields=lastUpdated,attributes[displayName~rename(name),value]`
        );
        const time =
            data.lastUpdated.substring(0, 10) +
            ' ' +
            data.lastUpdated.substring(11, 16);

        const content = data.attributes
            .map(
                ({ name, value }) =>
                    `<tr><th>${name}:</th><td>${value}</td></tr>`
            )
            .join('');

        this.context.map.openPopup(
            `<table>${content}<tr><th>${i18n.t(
                'Last updated'
            )}:</th><td>${time}</td></tr></table>`,
            coordinates
        );
    };
}

export default TrackedEntityLayer;
