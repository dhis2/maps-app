import { PureComponent } from 'react';
import Layer from './Layer';
import { filterData } from '../../util/filter';

class ThematicLayer extends Layer {

    createLayer(callback) {
        const {
            id,
            data,
            dataFilters,
            valueFilter = { gt: null, lt: null, },
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
                fontStyle: labelFontStyle
            };
            config.labelPane = id + '-labels';
        }

        this.layer = map.createLayer(config);
        this.layer.on('click', this.onFeatureClick, this);
        this.layer.on('contextmenu', this.onFeatureRightClick, this);

        if (isPlugin && legend) {
            map.legend = (map.legend || '') + this.getHtmlLegend(legend); // TODO: Better way to assemble the legend?
        }

        const layerBounds = this.layer.getBounds();

        if (layerBounds.isValid()) {
            map.invalidateSize();
            map.fitBounds(layerBounds); // TODO: Do as action?
        }
    }

    getHtmlLegend(legend) {
        const { title, items } = legend;

        return `
            <div class="dhis2-legend">
                <h2>${title}</h2>
                <span>Period</span>
                <dl class="dhis2-legend-automatic">
                    ${items.map(item => `
                        <dt style="background-color:${item.color}"></dt>
                        <dd>${item.name}</dd>
                    `).join('')}
                </dl>
            </div>`;
    }

    onFeatureClick(evt) {
        const { name, value } = evt.layer.feature.properties;
        const { columns, aggregationType, legend } = this.props;
        const map = this.context.map;
        const indicator = columns[0].items[0].name;
        const period = legend.period;
        const content = `
            <div class="leaflet-popup-orgunit">
                <em>${name}</em><br>
                ${indicator}<br>
                ${period}: ${value} ${aggregationType ? `(${aggregationType})` : ''}
            </div>`;

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

        // console.log(position);

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
