import i18next from 'i18next';
import Layer from './Layer';

export default class BoundaryLayer extends Layer {

    createLayer() {
        const props = this.props;
        const map = this.context.map;

        const config = {
            type: 'boundary',
            pane: props.id,
            data: props.data,
            hoverLabel: '{name}',
            style: {
                opacity: 1,
                fillOpacity: 0,
                fill: false,
            },
        };

        if (props.labels) {
            config.label = '{name}';
            config.labelStyle = {
                fontSize: props.labelFontSize,
                fontStyle: props.labelFontStyle
            };
        }

        if (props.radiusLow) {
            config.style.radius = props.radiusLow;
        }

        this.layer = map.createLayer(config);
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        map.fitBounds(this.layer.getBounds()); // TODO: Do as action?
    }

    onFeatureClick(evt) {
        const attr = evt.layer.feature.properties;
        let content = `<div class="leaflet-popup-orgunit"><em>${attr.name}</em>`;

        if (attr.level) {
            content += `<br/>${i18next.t('Level')}: ${attr.level}`;
        }

        if (attr.parentName) {
            content += `<br/>${i18next.t('Parent unit')}: ${attr.parentName}`;
        }

        content += '</div>';

        L.popup()
            .setLatLng(evt.latlng)
            .setContent(content)
            .openOn(this.context.map);
    }

    onFeatureRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        const latlng = evt.latlng;
        const position = [evt.originalEvent.x, evt.originalEvent.pageY || evt.originalEvent.y];
        const props = this.props;

        this.props.openContextMenu({
            position,
            coordinate: [latlng.lng, latlng.lat],
            layerId: props.id,
            layerType: props.layer,
            feature: evt.layer.feature,
        });
    }

    removeLayer() {
        this.layer.off('click', this.onFeatureClick, this);
        this.layer.off('contextmenu', this.onFeatureRightClick, this);

        super.removeLayer();
    }
}