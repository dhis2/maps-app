import React from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from '../Layer';
import LayerLoading from '../LayerLoading';
import EarthEnginePopup from './EarthEnginePopup';
import Alert from '../Alert';
import { getAuthToken } from '../../../../util/earthEngine';
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
            this.clearAggregations();
            this.removeLayer();
            this.createLayer(true);
            this.setLayerOrder();
        }
    };

    async createLayer(isUpdate) {
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
            noValue: i18n.t('no value'),
            legend: legend.items,
            resolution,
            projection,
            data,
            aggregationType,
            preload: this.hasAggregations(),
            getAuthToken: getAuthToken,
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

        try {
            this.layer = map.createLayer(config);
            await map.addLayer(this.layer);
        } catch (error) {
            this.onError(error);
        }

        this.getAggregations();

        this.fitBoundsOnce();
    }

    hasAggregations() {
        const { data, aggregationType } = this.props;
        return (
            data &&
            (typeof aggregationType === 'string' ||
                (Array.isArray(aggregationType) && aggregationType.length))
        );
    }

    getAggregations() {
        if (this.hasAggregations() && !this.state.aggregations) {
            this.setState({ aggregations: 'loading' });
            this.layer
                .getAggregations()
                .then(this.addAggregationValues.bind(this))
                .then(this.onLoad.bind(this))
                .catch(this.onError.bind(this));
        }
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

    clearAggregations() {
        if (this.hasAggregations()) {
            const { id, setAggregations } = this.props;
            this.setState({ aggregations: undefined });

            if (setAggregations) {
                setAggregations({ [id]: undefined });
            }
        }
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
        const isLoading = this.hasAggregations() && !this.state.aggregations;
        this.setState({ isLoading, popup: null });
    }

    onError(error) {
        this.setState({ error: error.message, isLoading: false });
    }
}
