import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import styles from './styles/LegendPosition.module.css';

export const legendPositions = [
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
];

export const LegendPosition = ({ position, onChange }) => (
    <div className={styles.root}>
        <div className={styles.label}>{i18n.t('Legend position')}</div>
        {legendPositions.map(pos => (
            <div
                key={pos}
                className={`${styles.position} ${
                    pos === position ? styles.selected : ''
                }`}
                onClick={pos !== position ? () => onChange(pos) : null}
            >
                <div className={`${styles.legend} ${styles[pos]}`} />
            </div>
        ))}
    </div>
);

LegendPosition.propTypes = {
    position: PropTypes.oneOf(legendPositions).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LegendPosition;
