import React from 'react';
import PropTypes from 'prop-types';
import { numberPrecision } from '../../../../util/numbers';
import { getEarthEngineAggregationType } from '../../../../constants/aggregationTypes';
import styles from './styles/PopupData.module.css';

const PopupData = ({ classes, values, legend }) => {
    const { title, period = '', unit, items = [] } = legend;
    const valueFormat = numberPrecision(2); // TODO configurable
    const postfix = '%'; // TODO configurable
    let rows = [];

    if (classes) {
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
                        {postfix}
                    </td>
                </tr>
            ));
    } else {
        rows = Object.keys(values).map(type => (
            <tr key={type}>
                <th>{getEarthEngineAggregationType(type)}:</th>
                <td>{valueFormat(values[type])}</td>
            </tr>
        ));
    }

    return (
        <table className={styles.table}>
            <caption>
                {title} {period}
                {unit && <div className={styles.unit}>{unit}</div>}
            </caption>
            <tbody>{rows}</tbody>
        </table>
    );
};

PopupData.propTypes = {
    classes: PropTypes.bool,
    values: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
};

export default PopupData;
