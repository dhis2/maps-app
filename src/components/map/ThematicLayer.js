import Layer from './Layer';
import { filterData } from '../../util/filter';
import { getHtmlLegend } from '../../util/legend';

class ThematicLayer extends Layer {
    createLayer() {
        const {
            id,
            data,
            dataFilters,
            labels,
            labelFontSize,
            labelFontStyle,
            legend,
            isPlugin,
        } = this.props;

        const map = this.context.map;

        const config = {
            type: 'choropleth',
            pane: id,
            data: filterData(data, dataFilters),
            hoverLabel: '{name} ({value})',
        };

        if (labels) {
            config.label = '{name}';
            config.labelStyle = {
                fontSize: labelFontSize,
                fontStyle: labelFontStyle,
            };
            config.labelPane = id + '-labels';
        }

        this.layer = map.createLayer(config);
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        // Create legend in HTML if showed as plugin
        if (isPlugin && legend) {
            console.log('Thematic', legend);
            map.legend =
                (map.legend || '') + getHtmlLegend(legend, data.length > 0);
        }

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.invalidateSize();
            map.fitBounds(layerBounds);
        }
    }

    onFeatureClick(evt) {
        const { name, value } = evt.layer.feature.properties;
        const { columns, aggregationType, legend } = this.props;
        const map = this.context.map;
        const indicator = columns[0].items[0].name || '';
        const period = legend.period;
        const content = `
            <div class="leaflet-popup-orgunit">
                <em>${name}</em><br>
                ${indicator}<br>
                ${period}: ${value} ${
            aggregationType ? `(${aggregationType})` : ''
        }
            </div>`;

        L.popup()
            .setLatLng(evt.latlng)
            .setContent(content)
            .openOn(map);
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

export default ThematicLayer;
