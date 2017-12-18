import { PureComponent } from 'react';
import Layer from './Layer';
import { filterData } from '../../util/filter';

class ThematicLayer extends Layer {

    createLayer(callback) {
        const props = this.props;
        const valueFilter = props.valueFilter || { gt: null, lt: null, };
        const map = this.context.map;

        const data = filterData(props.data, props.dataFilters);

        const config = {
            type: 'choropleth',
            pane: props.id,
            data: data,
            // hoverLabel: '{name} ({value})'
        };

        if (props.labels) {
            config.label = '{name}';
            config.labelStyle = {
                fontSize: props.labelFontSize,
                fontStyle: props.labelFontStyle
            };
            config.labelPane = props.id + '-labels';
        }

        this.layer = map.createLayer(config);

        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.fitBounds(this.layer.getBounds()); // TODO: Do as action?
        }
    }

    onFeatureClick(evt) {
        const map = this.context.map;
        const props = this.props;
        const indicator = props.columns[0].items[0].name;
        const period = props.filters[0].items[0].name;
        const name = evt.layer.feature.properties.name;
        const value = evt.layer.feature.properties.value;
        const aggregationType = evt.layer.feature.properties.aggregationType;
        const content = '<div class="leaflet-popup-orgunit"><em>' + name + '</em><br>' + indicator + '<br>' + period + ': ' + value + ' ' + (aggregationType ? '(' + aggregationType + ')' : '') + '</div>';

        L.popup()
            .setLatLng(evt.latlng)
            .setContent(content)
            .openOn(map);
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
            layerType: props.type,
            feature: evt.layer.feature,
        });
    }

    removeLayer() {
        this.layer.off('click', this.onFeatureClick, this);
        this.layer.off('contextmenu', this.onFeatureRightClick, this);

        super.removeLayer();
    }
}

export default ThematicLayer;
