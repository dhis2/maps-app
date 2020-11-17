import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles/LegendItemRange.module.css';

const LegendItemRange = ({ name = '', startValue, endValue, count }) => (
    <td className={styles.legendItemRange}>
        {isNaN(startValue) ? name : `${name} ${startValue} - ${endValue}`}
        {count !== undefined ? ` (${count})` : ''}
    </td>
);

LegendItemRange.propTypes = {
    name: PropTypes.string,
    startValue: PropTypes.number,
    endValue: PropTypes.number,
    count: PropTypes.number,
};

export default LegendItemRange;
