import React from 'react';
import Layer from '../Layer';
import MapLoadingMask from '../../MapLoadingMask';
import EarthEnginePopup from './EarthEnginePopup';
import Alert from '../Alert';
import { apiFetch } from '../../../../util/api';
import { filterData } from '../../../../util/filter';
import { EARTH_ENGINE_LAYER } from '../../../../constants/layers';

export default class EarthEngineLayer extends Layer {
    state = {
        isLoading: true,
        popup: null,
        aggregations: null,
        error: null,
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
            } catch (error) {
                this.setState({
                    error:
                        'Google Earth Engine failed. Is the service configured for this DHIS2 instance?',
                });
            }
        }
    }

    updateLayer = filterChange => {
        if (filterChange) {
            this.applyFilter();
        } else {
            this.removeLayer();
            this.createLayer(true);
            this.setLayerOrder();
        }
    };

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
        } = this.props;

        const { map } = this.context;

        const aggregate = data && aggregationType && aggregationType.length;

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
            data,
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

        try {
            this.layer = map.createLayer(config);
            map.addLayer(this.layer);
        } catch (error) {
            this.onError(error);
        }

        if (aggregate) {
            this.layer
                .aggregate(aggregationType)
                .then(this.addAggregationValues.bind(this))
                .catch(this.onError.bind(this));
        }

        this.fitBoundsOnce();
    }

    addAggregationValues(aggregations) {
        const { id, data, setAggregations } = this.props;

        // Make aggregations available for data table and download
        // setAggregations is not available in map plugin
        if (setAggregations) {
            setAggregations({ [id]: aggregations });
        }

        // Make aggregations available for filtering and popup
        this.setState({
            data: data.map(f => ({
                ...f,
                properties: {
                    ...f.properties,
                    ...aggregations[f.id],
                },
            })),
            aggregations,
        });
    }

    applyFilter() {
        const { data, dataFilters } = this.props;

        const filteredData = filterData(
            this.state.data || data,
            dataFilters
        ).map(f => f.id);

        if (this.layer && this.layer.filter) {
            this.layer.filter(filteredData);
        }
    }

    render() {
        const { legend, aggregationType } = this.props;
        const { isLoading, popup, aggregations, error } = this.state;

        if (error) {
            return (
                <Alert
                    message={error}
                    onHidden={() => this.setState({ error: null })}
                />
            );
        }

        if (isLoading) {
            return <MapLoadingMask />;
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
        this.setState({ isLoading: false, popup: null });
    }

    onError(error) {
        this.setState({ error, isLoading: false });
    }
}
