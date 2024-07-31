import React from 'react';
import i18n from '@dhis2/d2-i18n';
import Layer from '../Layer';
import MapLoadingMask from '../../MapLoadingMask';
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
                    error: i18n.t(
                        'Google Earth Engine failed. Is the service configured for this DHIS2 instance?'
                    ),
                });
            }
        }
    }

    updateLayer = async filterChange => {
        if (filterChange) {
            this.applyFilter();
        } else {
            this.clearAggregations();
            await this.removeLayer();
            await this.createLayer(true);
            this.setLayerOrder();
        }
    };

    async createLayer(isUpdate) {
        const {
            id,
            index,
            format = 'ImageCollection',
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
            tileScale,
            unmaskAggregation,
        } = this.props;

        const { map, isPlugin } = this.context;

        const config = {
            type: EARTH_ENGINE_LAYER,
            id,
            index,
            format,
            opacity,
            isVisible,
            datasetId,
            band,
            maskOperator: mask ? 'gt' : undefined,
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
            tileScale,
            unmaskAggregation,
            preload: !isPlugin && this.hasAggregations(),
            onClick: this.onFeatureClick.bind(this),
            onRightClick: this.onFeatureRightClick.bind(this),
            onLoad: this.onLoad.bind(this),
        };

        if (params) {
            config.style = params;
        } else if (legend?.items) {
            config.style = legend.items.map(item => ({
                ...item,
                value: item.id,
            }));
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

        config.getAuthToken = getAuthToken;

        try {
            this.layer = map.createLayer(config);
            await map.addLayer(this.layer);
        } catch (error) {
            this.onError(error);
        }

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

        return (
            <>
                {isLoading && <MapLoadingMask />}
                {error && (
                    <Alert
                        message={error}
                        onHidden={() => this.setState({ error: null })}
                    />
                )}
                {popup && (
                    <EarthEnginePopup
                        data={aggregations || {}}
                        legend={legend}
                        valueType={aggregationType}
                        onClose={this.onPopupClose}
                        {...popup}
                    />
                )}
            </>
        );
    }

    onFeatureClick(evt) {
        this.getAggregations();
        this.setState({ popup: evt });
    }

    onLoad() {
        this.setState({ isLoading: false, popup: null });

        if (!this.context.isPlugin) {
            this.getAggregations();
        }
    }

    onError(error) {
        let message = error.message || error;

        if (message.includes('memory limit exceeded') && this.props.error) {
            message = this.props.error;
        }

        this.setState({
            error: message,
            isLoading: false,
            aggregations: 'error',
        });
    }
}
