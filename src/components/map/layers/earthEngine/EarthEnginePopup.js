import React from 'react';
import PropTypes from 'prop-types';
import Popup from '../../Popup';
import { getPrecision } from '../../../../util/earthEngine';
import { numberPrecision } from '../../../../util/numbers';
import { getEarthEngineAggregationType } from '../../../../constants/aggregationTypes';
import styles from './styles/EarthEnginePopup.module.css';

const EarthEnginePopup = props => {
    const {
        coordinates,
        feature,
        data,
        classes,
        legend,
        valueType,
        onClose,
    } = props;
    const { id, name } = feature.properties;
    const { title, period = '', unit, items = [] } = legend;
    const values = data[id];
    const isPercentage = valueType === 'percentage';
    let rows = [];
    let header = null;

    if (values) {
        if (classes) {
            const valueFormat = numberPrecision(isPercentage ? 2 : 0);

            header = (
                <thead>
                    <tr>
                        <th colSpan="2">
                            {title} {period}
                        </th>
                        <th>{valueType}</th>
                    </tr>
                </thead>
            );

            rows = items
                .filter(i => values[i.id])
                .sort((a, b) => values[b.id] - values[a.id])
                .map(({ id, name, color }) => (
                    <tr key={id}>
                        <td
                            className={styles.color}
                            style={{
                                backgroundColor: color,
                            }}
                        ></td>
                        <td className={styles.name}>{name}</td>
                        <td>
                            {valueFormat(values[id])}
                            {isPercentage ? '%' : ''}
                        </td>
                    </tr>
                ));
        } else {
            header = (
                <caption>
                    {title} {period}
                    <div className={styles.unit}>{unit}</div>
                </caption>
            );

            rows = Object.keys(values).map(type => {
                const precision = getPrecision(
                    Object.values(data).map(d => d[type])
                );
                const valueFormat = numberPrecision(precision);

                return (
                    <tr key={type}>
                        <th>{getEarthEngineAggregationType(type)}:</th>
                        <td>{valueFormat(values[type])}</td>
                    </tr>
                );
            });
        }
    }

    return (
        <Popup
            coordinates={coordinates}
            onClose={onClose}
            className="dhis2-map-popup-orgunit"
        >
            <div className={styles.title}>{name}</div>
            {values && (
                <table className={styles.table}>
                    {header}
                    <tbody>{rows}</tbody>
                </table>
            )}
        </Popup>
    );
};

EarthEnginePopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    classes: PropTypes.bool,
    legend: PropTypes.object.isRequired,
    valueType: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default EarthEnginePopup;
