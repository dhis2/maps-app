import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { CircularLoader } from '@dhis2/ui';
import Popup from '../../Popup';
import { hasClasses, getPrecision } from '../../../../util/earthEngine';
import { numberPrecision } from '../../../../util/numbers';
import { getEarthEngineAggregationType } from '../../../../constants/aggregationTypes';
import styles from './styles/EarthEnginePopup.module.css';

const EarthEnginePopup = props => {
    const { coordinates, feature, data, legend, valueType, onClose } = props;
    const { id, name } = feature.properties;
    const { title, period = '', unit, items = [], groups } = legend;
    const values = typeof data === 'object' ? data[id] : null;
    const classes = hasClasses(valueType);
    const isPercentage = valueType === 'percentage';
    const isLoading = data === 'loading';
    let table = null;

    if (values) {
        const onlySum = valueType.length === 1 && valueType[0] === 'sum';

        if (classes) {
            const valueFormat = numberPrecision(isPercentage ? 2 : 0);

            table = (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th colSpan="2">
                                {title} {period}
                            </th>
                            <th>{valueType}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items
                            .filter(i => values[i.id])
                            .sort((a, b) => values[b.id] - values[a.id])
                            .map(({ id, name, color }) => (
                                <tr key={id} className={styles.classes}>
                                    <th
                                        style={{
                                            backgroundColor: color,
                                        }}
                                    ></th>
                                    <th>{name}</th>
                                    <td>
                                        {valueFormat(values[id])}
                                        {isPercentage ? '%' : ''}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            );
        } else {
            const getValueProp = (type, group) =>
                groups.length === 1
                    ? type
                    : valueType.length === 1
                    ? group
                    : `${group}_${type}`;

            const getValueFormat = type =>
                numberPrecision(
                    getPrecision(
                        Object.values(data)
                            .map(ou =>
                                Object.keys(ou)
                                    .filter(key => key.includes(type))
                                    .map(key => ou[key])
                            )
                            .flat()
                    )
                );

            const typeValueFormat = valueType.reduce((types, type) => {
                types[type] = getValueFormat(type);
                return types;
            }, {});

            const header = (
                <caption>
                    {title} {period}
                    {!onlySum && <div className={styles.unit}>{unit}</div>}
                </caption>
            );

            if (groups) {
                table = (
                    <table className={styles.table}>
                        {header}
                        <thead>
                            <tr>
                                <th>Group</th>
                                {valueType.map(type => (
                                    <th key={type}>
                                        {getEarthEngineAggregationType(type)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(({ id, name }) => (
                                <tr key={id}>
                                    <th>{name}</th>
                                    {valueType.map(type => (
                                        <td key={type}>
                                            {typeValueFormat[type](
                                                values[getValueProp(type, id)]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {groups.length > 1 && (
                            <tfoot>
                                <tr>
                                    <th>{i18n.t('All groups')}</th>
                                    {valueType.map(type => (
                                        <td key={type}>
                                            {typeValueFormat[type](
                                                values[type]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                );
            } else {
                table = (
                    <table className={styles.table}>
                        {header}
                        <tbody>
                            {valueType.map(type => (
                                <tr key={type}>
                                    <th>
                                        {getEarthEngineAggregationType(type)}:
                                    </th>
                                    <td>
                                        {typeValueFormat[type](values[type])}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            }
        }
    }

    return (
        <Popup
            coordinates={coordinates}
            orgUnitId={id}
            onClose={onClose}
            className="dhis2-map-popup-orgunit"
        >
            <div className={styles.title}>{name}</div>
            {table}
            {isLoading && (
                <div className={styles.loading}>
                    <CircularLoader small />
                    {i18n.t('Loading data')}
                </div>
            )}
        </Popup>
    );
};

EarthEnginePopup.propTypes = {
    coordinates: PropTypes.array.isRequired,
    feature: PropTypes.object.isRequired,
    data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    legend: PropTypes.object.isRequired,
    valueType: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    onClose: PropTypes.func.isRequired,
};

export default EarthEnginePopup;
