import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import classes from './styles/LegendPosition.module.css';

export const legendPositions = [
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
];

export const LegendPosition = ({ position, onChange }) => (
    <div className={classes.root}>
        <div className={classes.label}>{i18n.t('Legend position')}</div>
        {legendPositions.map(pos => (
            <div
                key={pos}
                className={`${classes.position} ${
                    pos === position ? classes.selected : ''
                }`}
                onClick={pos !== position ? () => onChange(pos) : null}
            >
                <div className={`${classes.legend} ${classes[pos]}`} />
            </div>
        ))}
    </div>
);

LegendPosition.propTypes = {
    position: PropTypes.oneOf(legendPositions).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LegendPosition;
