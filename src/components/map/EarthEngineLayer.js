import React from 'react';
import Layer from './Layer';
import LayerLoading from './LayerLoading';
import Popup from './Popup';
import { apiFetch } from '../../util/api';
import { numberPrecision } from '../../util/numbers';
import { getEarthEngineAggregationType } from '../../constants/aggregationTypes';
import { formatNumber } from '../../util/earthEngine';
import styles from './styles/EarthEngineLayer.module.css';

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
        // console.log('aggregations', aggregations);

        // Make aggregations available for data table
        this.props.data.forEach(f => {
            const values = aggregations[f.id];
            if (values) {
                Object.keys(values).forEach(
                    key => (f.properties[key] = values[key])
                );
            }
            f.properties.type = f.geometry.type;
        });

        // Make aggregations available for popup
        // console.log('aggregations', aggregations);
        this.setState({ aggregations });
    }

    getPopup() {
        const { popup, aggregations } = this.state;
        const {
            name: layerName,
            aggregationType,
            unit,
            classes,
            legend,
            params,
        } = this.props;
        const { coordinates, feature } = popup;
        const { id, name } = feature.properties;
        const valueFormat = numberPrecision(2);

        let values;

        if (aggregations) {
            values = aggregations[id];
        }

        return (
            <Popup
                coordinates={coordinates}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-orgunit"
            >
                <div className={styles.title}>{name}</div>
                {classes && values && (
                    <table className={styles.table}>
                        <caption>{layerName}</caption>
                        <tbody>
                            {Object.keys(values).map(key => {
                                const index = Number(key) - params.min;
                                const { color, name } = legend.items[index];
                                const { area, percent } = values[key];

                                return (
                                    <tr key={key}>
                                        <td
                                            className={styles.color}
                                            style={{
                                                backgroundColor: color,
                                            }}
                                        ></td>
                                        <td className={styles.name}>{name}</td>
                                        <td>{valueFormat(area)}</td>
                                        <td>{valueFormat(percent)}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                {Array.isArray(aggregationType) && values && (
                    <table className={styles.table}>
                        <caption>
                            {layerName}
                            <div className={styles.unit}>{unit}</div>
                        </caption>
                        <tbody>
                            {aggregationType.map(type => (
                                <tr key={type}>
                                    <th>
                                        {getEarthEngineAggregationType(type)}:
                                    </th>
                                    <td>
                                        {formatNumber(aggregations, id, type)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Popup>
        );
    }

    render() {
        const { isLoading, popup } = this.state;

        if (isLoading) {
            return <LayerLoading />;
        }

        return popup ? this.getPopup() : null;
    }

    onFeatureClick(evt) {
        this.setState({ popup: evt });
    }

    onLoad() {
        this.setState({ isLoading: false });
    }
}
