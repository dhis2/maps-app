import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { Help } from '@dhis2/ui';
import { NumberField } from '../../core';
import { setRadiusLow, setRadiusHigh } from '../../../actions/layerEdit';
import {
    THEMATIC_RADIUS_LOW,
    THEMATIC_RADIUS_HIGH,
    THEMATIC_RADIUS_MIN,
    THEMATIC_RADIUS_MAX,
} from '../../../constants/layers';
import styles from './styles/RadiusSelect.module.css';

export const isValidRadius = (
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH
) =>
    !isNaN(radiusLow) &&
    !isNaN(radiusHigh) &&
    radiusLow <= radiusHigh &&
    radiusLow >= THEMATIC_RADIUS_MIN &&
    radiusHigh <= THEMATIC_RADIUS_MAX;

const RadiusSelect = ({
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH,
    setRadiusLow,
    setRadiusHigh,
    className,
}) => (
    <Fragment>
        <NumberField
            label={i18n.t('Low radius')}
            value={isNaN(radiusLow) ? '' : radiusLow}
            onChange={setRadiusLow}
            className={className}
        />
        <NumberField
            label={i18n.t('High radius')}
            value={isNaN(radiusHigh) ? '' : radiusHigh}
            onChange={setRadiusHigh}
            className={className}
        />
        {!isValidRadius(radiusLow, radiusHigh) && (
            <div className={styles.error}>
                <Help warning>
                    {i18n.t('Radius should be between {{min}} and {{max}}', {
                        min: THEMATIC_RADIUS_MIN,
                        max: THEMATIC_RADIUS_MAX,
                    })}
                </Help>
            </div>
        )}
    </Fragment>
);

RadiusSelect.propTypes = {
    radiusLow: PropTypes.number,
    radiusHigh: PropTypes.number,
    setRadiusLow: PropTypes.func.isRequired,
    setRadiusHigh: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default connect(
    ({ layerEdit }) => ({
        radiusLow: layerEdit.radiusLow,
        radiusHigh: layerEdit.radiusHigh,
    }),
    { setRadiusLow, setRadiusHigh }
)(RadiusSelect);
