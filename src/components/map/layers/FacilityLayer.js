import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { isPlainObject } from 'lodash/fp';
import Layer from './Layer';
import Popup from '../Popup';
import { filterData } from '../../../util/filter';
import { cssColor } from '../../../util/colors';
import {
    LABEL_FONT_SIZE,
    LABEL_FONT_STYLE,
    LABEL_FONT_WEIGHT,
    LABEL_FONT_COLOR,
} from '../../../constants/layers';

class FacilityLayer extends Layer {
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
            dataFilters,
            labels,
            areaRadius,
            labelFontColor,
            labelFontSize,
            labelFontStyle,
            labelFontWeight,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        // Create layer config object
        const config = {
            type: 'markers',
            id,
            index,
            opacity,
            isVisible,
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

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce();
    }

    getPopup() {
        const { coordinates, feature } = this.state.popup;
        const { id, name, dimensions, pn } = feature.properties;

        return (
            <Popup
                coordinates={coordinates}
                orgUnitId={id}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-orgunit"
            >
                <em>{name}</em>
                {isPlainObject(dimensions) && (
                    <div>
                        {i18n.t('Groups')}:
                        {Object.keys(dimensions)
                            .map(id => dimensions[id])
                            .join(', ')}
                    </div>
                )}
                {pn && (
                    <div>
                        {i18n.t('Parent unit')}: {pn}
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
}

export default FacilityLayer;
