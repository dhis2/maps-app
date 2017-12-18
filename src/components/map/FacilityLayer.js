import i18next from 'i18next';
import isObject from 'd2-utilizr/lib/isObject';
import Layer from './Layer';

class FacilityLayer extends Layer {

    createLayer(callback) {
        const props = this.props;
        const map = this.context.map;

        // Create layer config object
        const config = {
            type: 'markers',
            pane: props.id,
            data: props.data,
            hoverLabel: '{label}',
        };

        // Labels and label style
        if (props.labels) {
            config.label = '{name}';
            config.labelStyle = {
                color: props.labelFontColor,
                fontSize: props.labelFontSize,
                fontStyle: props.labelFontStyle,
                fontWeight: props.labelFontWeight,
                paddingTop: '10px'
            };
        }

        // Remove area layer instance if already exist
        if (this.areaInstance && map.hasLayer(this.areaInstance)) {
            map.removeLayer(this.areaInstance);
        }

        // Create and add area layer
        if (props.areaRadius) {
            this.areaInstance = map.addLayer({
                type: 'circles',
                radius: props.areaRadius,
                highlightStyle: false,
                data: props.data
            });
        }

        // Create and add facility layer based on config object
        this.layer = map.createLayer(config); // .addTo(map);

        // Handle facility click
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        // Defined in parent class
        // this.onLayerAdd();

        map.fitBounds(this.layer.getBounds()); // TODO: Do as action?
    }

    // Show pupup on facility click
    onFeatureClick(evt) {
        const attr = evt.layer.feature.properties;
        let content = `<div class="leaflet-popup-orgunit"><em>${attr.name}</em>`;

        if (isObject(attr.dimensions)) {
            content += `<br/>${i18next.t('Groups')}: ${Object.keys(attr.dimensions).map(id => attr.dimensions[id]).join(', ')}`;
        }

        if (attr.pn) {
            content += `<br/>${i18next.t('Parent unit')}: ${attr.pn}`;
        }

        content += '</div>';

        L.popup()
            .setLatLng(evt.latlng)
            .setContent(content)
            .openOn(this.context.map);
    };

    onFeatureRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        const latlng = evt.latlng;
        const position = [evt.originalEvent.x, evt.originalEvent.pageY || evt.originalEvent.y];
        const propsr = this.props;

        this.props.openContextMenu({
            position,
            coordinate: [latlng[1], latlng[0]],
            layerId: props.id,
            layerType: props.type,
            feature: evt.layer.feature,
        });
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

export default FacilityLayer;