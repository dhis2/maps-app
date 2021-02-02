import React from 'react';
import Layer from '../Layer';
import LayerLoading from '../LayerLoading';
import EarthEnginePopup from './EarthEnginePopup';
import { apiFetch } from '../../../../util/api';

export default class EarthEngineLayer extends Layer {
    state = {
        isLoading: true,
        popup: null,
        aggregations: null,
    };

    componentDidUpdate(prev) {
        super.componentDidUpdate(prev);

        const { coordinate } = this.props;

        if (coordinate && coordinate !== prev.coordinate) {
            try {
                this.layer.showValue({
                    lng: coordinate[0],
                    lat: coordinate[1],
                });
            } catch (err) {
                // eslint-disable-next-line
                console.error(
                    'Google Earth Engine failed. Is the service configured for this DHIS2 instance?'
                );
            }
        }
    }

    createLayer(isUpdate) {
        const {
            id,
            index,
            opacity,
            isVisible,
            datasetId,
            band,
            mask,
            attribution,
            filter,
            classes,
            reducer,
            methods,
            mosaic,
            name,
            unit,
            legend,
            value,
            resolution,
            projection,
            params,
            popup,
            data,
            aggregationType,
        } = this.props;

        const { map } = this.context;

        const config = {
            type: 'earthEngine',
            id,
            index,
            opacity,
            isVisible,
            datasetId,
            band,
            mask,
            attribution,
            filter,
            classes,
            reducer,
            methods,
            mosaic,
            name,
            unit,
            value,
            legend: legend ? legend.items : null,
            resolution,
            projection,
            data,
            aggregationType,
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
            onLoad: this.onLoad.bind(this),
        };

        if (params) {
            config.params = params;
        }

        if (popup) {
            config.popup = popup;
        }

        if (isUpdate) {
            this.setState({ isLoading: true });
        }

        config.accessToken = apiFetch('/tokens/google'); // returns promise

        this.layer = map.createLayer(config);
        map.addLayer(this.layer);

        // if (Array.isArray(aggregationType) && aggregationType.length) {
        this.layer.aggregate().then(this.addAggregationValues.bind(this));
        // }

        this.fitBoundsOnce();
    }

    addAggregationValues(aggregations) {
        const { data, classes, legend } = this.props;
        const { items } = legend;

        // Make aggregations available for data table/download
        data.forEach(f => {
            const values = aggregations[f.id];

            if (values) {
                if (classes && items) {
                    items.forEach(({ id, name }) => {
                        f.properties[name] = values[id];
                    });
                } else {
                    Object.keys(values).forEach(
                        key => (f.properties[key] = values[key])
                    );
                }
            }
            f.properties.type = f.geometry.type;
        });

        // Make aggregations available for popup
        this.setState({ aggregations });
    }

    render() {
        const { classes, legend, aggregationType } = this.props;
        const { isLoading, popup, aggregations } = this.state;
        const valueType = Array.isArray(aggregationType)
            ? aggregationType[0]
            : null;

        if (isLoading) {
            return <LayerLoading />;
        }

        return popup ? (
            <EarthEnginePopup
                data={aggregations || {}}
                classes={classes}
                legend={legend}
                valueType={valueType}
                onClose={this.onPopupClose}
                {...popup}
            />
        ) : null;
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt });
    }

    onLoad() {
        this.setState({ isLoading: false });
    }
}
