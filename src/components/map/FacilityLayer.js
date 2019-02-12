import i18n from '@dhis2/d2-i18n';
import { isPlainObject } from 'lodash/fp';
import Layer from './Layer';
import { filterData } from '../../util/filter';
import { cssColor } from '../../util/colors';
import {
    LABEL_FONT_SIZE,
    LABEL_FONT_STYLE,
    LABEL_FONT_WEIGHT,
    LABEL_FONT_COLOR,
} from '../../constants/layers';

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
            id,
            data: filteredData,
            hoverLabel: '{label}',
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        };

        // Labels and label style
        if (labels) {
            const fontSize = labelFontSize || LABEL_FONT_SIZE;

            config.label = '{name}';
            config.labelStyle = {
                fontSize,
                fontStyle: labelFontStyle || LABEL_FONT_STYLE,
                fontWeight: labelFontWeight || LABEL_FONT_WEIGHT,
                lineHeight: parseInt(fontSize, 10) * 1.2 + 'px',
                color: cssColor(labelFontColor) || LABEL_FONT_COLOR,
                paddingTop: '10px',
            };
        }

        if (areaRadius) {
            config.buffer = areaRadius;
        }

        // Create and add facility layer based on config object
        this.layer = map.createLayer(config);
        map.addLayer(this.layer);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    // Show pupup on facility click
    onFeatureClick(evt) {
        const { feature, coordinates } = evt;
        const { name, dimensions, pn } = feature.properties;
        let content = `<div class="leaflet-popup-orgunit"><em>${name}</em>`;

        if (isPlainObject(dimensions)) {
            content += `<br/>${i18n.t('Groups')}: ${Object.keys(dimensions)
                .map(id => dimensions[id])
                .join(', ')}`;
        }

        if (pn) {
            content += `<br/>${i18n.t('Parent unit')}: ${pn}`;
        }

        content += '</div>';

        this.context.map.openPopup(content, coordinates);
    }

    onFeatureRightClick(evt) {
        const { id, layer } = this.props;

        this.props.openContextMenu({
            ...evt,
            layerId: id,
            layerType: layer,
        });
    }
}

export default FacilityLayer;
