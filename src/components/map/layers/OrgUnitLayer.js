import React from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import Popup from '../Popup';
import { filterData } from '../../../util/filter';
import { LABEL_FONT_SIZE, LABEL_FONT_STYLE } from '../../../constants/layers';
import { ORG_UNIT_COLOR, GEOJSON_LAYER } from '../../../constants/layers';

export default class OrgUnitLayer extends Layer {
    state = {
        popup: null,
    };

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            labels,
            labelFontSize,
            labelFontStyle,
            radiusLow,
            dataFilters,
            eventPointColor: orgUnitColor = ORG_UNIT_COLOR,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        const config = {
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            hoverLabel: '{name}',
            style: {
                color: 'transparent',
                strokeColor: orgUnitColor,
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

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce();
    }

    getPopup() {
        const { coordinates, feature } = this.state.popup;
        const { id, name, level, parentName } = feature.properties;

        return (
            <Popup
                coordinates={coordinates}
                orgUnitId={id}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-orgunit"
            >
                <em>{name}</em>
                {level && (
                    <div>
                        {i18n.t('Level')}: {level}
                    </div>
                )}
                {parentName && (
                    <div>
                        {i18n.t('Parent unit')}: {parentName}
                    </div>
                )}
            </Popup>
        );
    }

    render() {
        return this.state.popup ? this.getPopup() : null;
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt });
    }

    removeLayer() {
        this.layer.off('click', this.onFeatureClick, this);
        super.removeLayer();
    }
}
