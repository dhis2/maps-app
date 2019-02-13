import Layer from './Layer';
import { filterData } from '../../util/filter';
import { cssColor } from '../../util/colors';
import { removeLineBreaks } from '../../util/helpers';
import {
    LABEL_FONT_SIZE,
    LABEL_FONT_STYLE,
    LABEL_FONT_WEIGHT,
    LABEL_FONT_COLOR,
} from '../../constants/layers';

class ThematicLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
            data,
            dataFilters,
            labels,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
            labelFontColor,
            editCounter,
        } = this.props;

        const map = this.context.map;

        const config = {
            type: 'choropleth',
            id,
            index,
            data: filterData(data, dataFilters),
            hoverLabel: '{name} ({value})',
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        };

        if (labels) {
            const fontSize = labelFontSize || LABEL_FONT_SIZE;

            config.label = '{name}';
            config.labelStyle = {
                fontSize,
                fontStyle: labelFontStyle || LABEL_FONT_STYLE,
                fontWeight: labelFontWeight || LABEL_FONT_WEIGHT,
                color: cssColor(labelFontColor) || LABEL_FONT_COLOR,
                lineHeight: parseInt(fontSize, 10) * 1.2 + 'px',
            };
        }

        this.layer = map.createLayer(config);
        map.addLayer(this.layer);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    onFeatureClick(evt) {
        const { feature, coordinates } = evt;
        const { name, value } = feature.properties;
        const { columns, aggregationType, legend } = this.props;
        const indicator = columns[0].items[0].name || '';
        const { period } = legend;
        const content = `<div class="leaflet-popup-orgunit">
            <em>${name}</em><br>
            ${indicator}<br>
            ${period}: ${value} ${aggregationType ? `(${aggregationType})` : ''}
        </div>`;

        this.context.map.openPopup(removeLineBreaks(content), coordinates);
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

export default ThematicLayer;
