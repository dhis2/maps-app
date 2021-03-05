import React from 'react';
import Layer from '../Layer';
import LayerLoading from '../LayerLoading';
import EarthEnginePopup from './EarthEnginePopup';
import { apiFetch } from '../../../../util/api';
import { filterData } from '../../../../util/filter';
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers';

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
            areaRadius,
            dataFilters,
        } = this.props;

        const { map } = this.context;

        const aggregate = data && aggregationType && aggregationType.length;
        const filteredData = filterData(data, dataFilters);

        const config = {
            type: EARTH_ENGINE_LAYER,
            id,
            index,
            opacity,
            isVisible,
            datasetId,
            band,
            mask,
            attribution,
            filter,
            methods,
            mosaic,
            name,
            unit,
            value,
            legend: legend.items,
            resolution,
            projection,
            data: filteredData,
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
            onLoad: this.onLoad.bind(this),
        };

        if (params) {
            config.params = params;
        }

        if (areaRadius) {
            config.buffer = areaRadius;
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

        if (aggregate) {
            this.layer
                .aggregate(aggregationType)
                .then(this.addAggregationValues.bind(this));
        }

        this.fitBoundsOnce();
    }

    addAggregationValues(aggregations) {
        const { id, setAggregations } = this.props;

        // Make aggregations available for data table and download
        // setAggregations is not available in map plugin
        if (setAggregations) {
            setAggregations({ [id]: aggregations });
        }

        // Make aggregations available for popup
        this.setState({ aggregations });
    }

    render() {
        const { legend, aggregationType } = this.props;
        const { isLoading, popup, aggregations } = this.state;

        if (isLoading) {
            return <LayerLoading />;
        }

        return popup ? (
            <EarthEnginePopup
                data={aggregations || {}}
                legend={legend}
                valueType={aggregationType}
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
