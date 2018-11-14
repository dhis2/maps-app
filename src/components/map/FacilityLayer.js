import i18n from '@dhis2/d2-i18n';
import { isPlainObject } from 'lodash/fp';
import Layer from './Layer';
import { filterData } from '../../util/filter';

class FacilityLayer extends Layer {
    createLayer() {
        const {
            id,
            data,
            dataFilters,
            labels,
            areaRadius,
            labelFontColor,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
            editCounter,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        // Create layer config object
        const config = {
            type: 'markers',
            pane: id,
            data: filteredData,
            hoverLabel: '{label}',
        };

        // Labels and label style
        if (labels) {
            config.label = '{name}';
            config.labelStyle = {
                color: labelFontColor,
                fontSize: labelFontSize,
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                paddingTop: '10px',
            };
        }

        // Create and add facility layer based on config object
        this.layer = map.createLayer(config).addTo(map);

        // Create and add area layer
        if (areaRadius) {
            this.buffers = map.addLayer({
                type: 'circles',
                pane: `${id}-area`,
                radius: areaRadius,
                highlightStyle: false,
                data: filteredData,
            });
        }

        // Handle facility click
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    // Show pupup on facility click
    onFeatureClick(evt) {
        const attr = evt.layer.feature.properties;
        let content = `<div class="leaflet-popup-orgunit"><em>${
            attr.name
        }</em>`;

        if (isPlainObject(attr.dimensions)) {
            content += `<br/>${i18n.t('Groups')}: ${Object.keys(attr.dimensions)
                .map(id => attr.dimensions[id])
                .join(', ')}`;
        }

        if (attr.pn) {
            content += `<br/>${i18n.t('Parent unit')}: ${attr.pn}`;
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
        const position = [
            evt.originalEvent.x,
            evt.originalEvent.pageY || evt.originalEvent.y,
        ];
        const props = this.props;

        this.props.openContextMenu({
            position,
            coordinate: [latlng[1], latlng[0]],
            layerId: props.id,
            layerType: props.layer,
            feature: evt.layer.feature,
        });
    }
}

export default FacilityLayer;
