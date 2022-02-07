import React from 'react';
import i18n from '@dhis2/d2-i18n';
import { isPlainObject } from 'lodash/fp';
import Layer from './Layer';
import Popup from '../Popup';
import { filterData } from '../../../util/filter';
import { getLabelStyle } from '../../../util/labels';
import { getContrastColor } from '../../../util/colors';
import { ORG_UNIT_COLOR, GEOJSON_LAYER } from '../../../constants/layers';

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
            associatedGeometries,
            organisationUnitColor: color = ORG_UNIT_COLOR,
            organisationUnitGroupSet,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        const strokeColor = organisationUnitGroupSet
            ? color
            : getContrastColor(color);

        const group = map.createLayer({
            type: 'group',
            id,
            index,
            opacity,
            isVisible,
        });

        // Create layer config object
        const config = {
            type: GEOJSON_LAYER,
            data: filteredData,
            hoverLabel: '{name}',
            style: {
                color,
                strokeColor,
            },
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        };

        // Labels and label style
        if (labels) {
            config.label = '{name}';
            config.labelStyle = {
                ...getLabelStyle(this.props),
                paddingTop: '10px',
            };
        }

        if (areaRadius) {
            config.buffer = areaRadius;
        }

        if (associatedGeometries) {
            group.addLayer({
                type: GEOJSON_LAYER,
                data: associatedGeometries,
                style: {
                    color: 'rgb(149, 200, 251)',
                    opacityFactor: 0.5,
                },
            });
        }

        // Create and add facility layer based on config object
        group.addLayer(config);

        this.layer = group;

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
