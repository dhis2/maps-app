import React, { Fragment } from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import Timeline from '../../periods/Timeline';
import PeriodName from '../PeriodName';
import Popup from '../Popup';
import { filterData } from '../../../util/filter';
import { cssColor } from '../../../util/colors';
import { getPeriodFromFilters } from '../../../util/analytics';
import { polygonsToPoints } from '../../../util/geojson';
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    THEMATIC_CHOROPLETH,
    THEMATIC_BUBBLE,
    LABEL_FONT_SIZE,
    LABEL_FONT_STYLE,
    LABEL_FONT_WEIGHT,
    LABEL_FONT_COLOR,
    BOUNDARY_LAYER,
} from '../../../constants/layers';

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
            valuesByPeriod,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
            thematicMapType = THEMATIC_CHOROPLETH,
            noDataColor,
        } = this.props;

        const { period } = this.state;

        const bubbleMap = thematicMapType === THEMATIC_BUBBLE;

        let periodData = bubbleMap ? polygonsToPoints(data) : data;

        if (renderingStrategy !== RENDERING_STRATEGY_SINGLE) {
            const values = valuesByPeriod[period.id] || {};

            periodData = periodData.map(feature => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    ...values[feature.id],
                },
            }));

            // Remove org unit features if noDataColor is missing
            if (!noDataColor) {
                periodData = periodData.filter(
                    feature => values[feature.id] !== undefined
                );
            }
        }

        const map = this.context.map;

        const filteredData = filterData(periodData, dataFilters);

        const config = {
            type: 'choropleth',
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            hoverLabel: '{name} ({value})',
            color: noDataColor,
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

        // Add boundaries as a separate layer
        if (bubbleMap) {
            this.layer = map.createLayer({
                type: 'group',
                id,
                index,
                opacity,
                isVisible,
            });

            this.layer.addLayer({
                type: BOUNDARY_LAYER,
                data: data.map(f => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        style: {
                            color: '#333',
                            weight: 0.5,
                        },
                    },
                })),
                style: {},
            });

            this.layer.addLayer(config);
        } else {
            this.layer = map.createLayer(config);
        }

        map.addLayer(this.layer);

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce();
    }

    // Set initial period
    setPeriod(callback) {
        const {
            period,
            periods,
            renderingStrategy = RENDERING_STRATEGY_SINGLE,
        } = this.props;

        if (!period && !periods) {
            return;
        }

        const initialPeriod = {
            period:
                renderingStrategy === RENDERING_STRATEGY_SINGLE
                    ? null
                    : period || periods[0],
        };

        // setPeriod without callback is called from the constructor (unmounted)
        if (!callback) {
            this.state = initialPeriod;
        } else {
            this.setState(initialPeriod, callback);
        }
    }

    getPopup() {
        const { columns, aggregationType, legend } = this.props;
        const { popup, period } = this.state;
        const { coordinates, feature } = popup;
        const { name, value } = feature.properties;
        const indicator = columns[0].items[0].name || '';
        const periodName = period ? period.name : legend.period;

        return (
            <Popup
                coordinates={coordinates}
                onClose={() => this.onPopupClose(popup)}
                className="dhis2-map-popup-orgunit"
            >
                <em>{name}</em>
                <div>{indicator}</div>
                <div>{periodName}</div>
                <div>
                    {i18n.t('Value')}: {value}
                </div>
                {aggregationType && aggregationType !== 'DEFAULT' && (
                    <div>{aggregationType}</div>
                )}
            </Popup>
        );
    }

    render() {
        const { periods, renderingStrategy, filters } = this.props;
        const { period, popup } = this.state;
        const { id } = getPeriodFromFilters(filters) || {};

        return (
            <Fragment>
                {renderingStrategy === RENDERING_STRATEGY_TIMELINE && period && (
                    <Fragment>
                        <PeriodName period={period.name} isTimeline={true} />
                        <Timeline
                            periodId={id}
                            period={period}
                            periods={periods}
                            onChange={this.onPeriodChange}
                        />
                    </Fragment>
                )}
                {popup && this.getPopup()}
            </Fragment>
        );
    }

    onPeriodChange = period => this.setState({ period });

    onFeatureClick(evt) {
        this.setState({ popup: evt });
    }
}

export default ThematicLayer;
