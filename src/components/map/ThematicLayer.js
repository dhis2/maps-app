import React from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import Timeline from '../periods/Timeline';
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
            opacity,
            isVisible,
            data,
            dataFilters,
            labels,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
            labelFontColor,
            editCounter,
            valuesByPeriod,
        } = this.props;
        const { period } = this.state;

        if (period) {
            const values = valuesByPeriod[period.id];

            data.forEach(feature => {
                feature.properties = {
                    ...feature.properties,
                    ...values[feature.id],
                };
            });
        }

        const map = this.context.map;

        const config = {
            type: 'choropleth',
            id,
            index,
            opacity,
            isVisible,
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

        if (!editCounter || map.getZoom() === undefined) {
            this.fitBounds();
        }
    }

    // Set initial period
    setPeriod() {
        const { period, periods } = this.props;

        this.state = {
            period: period || periods[0],
        };
    }

    render() {
        const { periods, renderingStrategy } = this.props;
        const { period } = this.state;

        if (renderingStrategy !== 'TIMELINE') {
            return null;
        }

        return (
            <Timeline
                period={period}
                periods={periods}
                onChange={this.onPeriodChange}
            />
        );
    }

    onPeriodChange = period => this.setState({ period });

    onFeatureClick(evt) {
        const { feature, coordinates } = evt;
        const { name, value } = feature.properties;
        const { period, columns, aggregationType, legend } = this.props;
        const indicator = columns[0].items[0].name || '';
        const periodName = period ? period.name : legend.period;
        const content = `
            <div class="dhis2-map-popup-orgunit">
                <em>${name}</em><br>
                ${indicator}<br>
                ${periodName}<br>
                ${i18n.t('Value')}: ${value} ${
            aggregationType && aggregationType !== 'DEFAULT'
                ? `(${aggregationType})`
                : ''
        }
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
