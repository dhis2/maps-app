/* global L */

import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import { filterData } from '../../util/filter';
import { LABEL_FONT_SIZE, LABEL_FONT_STYLE } from '../../constants/layers';

export default class BoundaryLayer extends Layer {
    createLayer() {
        const {
            id,
            data,
            labels,
            labelFontSize,
            labelFontStyle,
            radiusLow,
            dataFilters,
            editCounter,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        const config = {
            type: 'boundary',
            pane: id,
            data: filteredData,
            hoverLabel: '{name}',
            style: {
                opacity: 1,
                fillOpacity: 0,
                fill: false,
            },
        };

        if (labels) {
            const fontSize = labelFontSize || LABEL_FONT_SIZE;

            config.label = '{name}';
            config.labelStyle = {
                fontSize,
                fontStyle: labelFontStyle || LABEL_FONT_STYLE,
                lineHeight: parseInt(fontSize, 10) * 1.2 + 'px',
            };
        }

        if (radiusLow) {
            config.style.radius = radiusLow;
        }

        this.layer = map.createLayer(config);
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    onFeatureClick(evt) {
        const attr = evt.layer.feature.properties;
        let content = `<div class="leaflet-popup-orgunit"><em>${
            attr.name
        }</em>`;

        if (attr.level) {
            content += `<br/>${i18n.t('Level')}: ${attr.level}`;
        }

        if (attr.parentName) {
            content += `<br/>${i18n.t('Parent unit')}: ${attr.parentName}`;
        }

        content += '</div>';

        // TODO: Should not be dependant on L in global namespace
        L.popup()
            .setLatLng(evt.latlng)
            .setContent(content)
            .openOn(this.context.map);
    }

    onFeatureRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        const latlng = evt.latlng;
        const position = [
            evt.originalEvent.x,
            evt.originalEvent.pageY || evt.originalEvent.y,
        ];
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
