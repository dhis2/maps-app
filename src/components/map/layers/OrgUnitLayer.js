import React from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import Popup from '../Popup';
import { filterData } from '../../../util/filter';
import { getLabelStyle } from '../../../util/labels';
import {
    ORG_UNIT_COLOR,
    // GEOJSON_LAYER,
    VECTOR_TILE,
} from '../../../constants/layers';

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
            radiusLow,
            dataFilters,
            organisationUnitColor = ORG_UNIT_COLOR,
        } = this.props;

        const filteredData = filterData(data, dataFilters);

        const map = this.context.map;

        const config = {
            type: VECTOR_TILE, // GEOJSON_LAYER
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            source:
                'http://127.0.0.1:3000/v1/mvt/organisationunit/{z}/{x}/{y}?geom_column=geometry',
            hoverLabel: '{name}',
            style: {
                color: 'transparent',
                strokeColor: organisationUnitColor,
            },
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
        };

        if (labels) {
            config.label = '{name}';
            config.labelStyle = getLabelStyle(this.props);
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
}
