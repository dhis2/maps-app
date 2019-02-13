import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import { filterData } from '../../util/filter';
import { LABEL_FONT_SIZE, LABEL_FONT_STYLE } from '../../constants/layers';

export default class BoundaryLayer extends Layer {
    createLayer() {
        const {
            id,
            index,
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
            id,
            index,
            data: filteredData,
            hoverLabel: '{name}',
            style: {
                opacity: 1,
                fillOpacity: 0,
                fill: false,
            },
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
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
        map.addLayer(this.layer);

        // Only fit map to layer bounds on first add
        if (!editCounter) {
            this.fitBounds();
        }
    }

    onFeatureClick(evt) {
        const { feature, coordinates } = evt;
        const { name, level, parentName } = feature.properties;

        let content = `<div class="leaflet-popup-orgunit"><em>${name}</em>`;

        if (level) {
            content += `<br/>${i18n.t('Level')}: ${level}`;
        }

        if (parentName) {
            content += `<br/>${i18n.t('Parent unit')}: ${parentName}`;
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

    removeLayer() {
        this.layer.off('click', this.onFeatureClick, this);
        this.layer.off('contextmenu', this.onFeatureRightClick, this);

        super.removeLayer();
    }
}
