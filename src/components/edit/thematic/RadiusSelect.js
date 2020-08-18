import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import TextField from '../../core/TextField';
import { setRadiusLow, setRadiusHigh } from '../../../actions/layerEdit';
import {
    THEMATIC_RADIUS_LOW,
    THEMATIC_RADIUS_HIGH,
    THEMATIC_RADIUS_MIN,
    THEMATIC_RADIUS_MAX,
} from '../../../constants/layers';

export const isValidRadius = (
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH
) =>
    !isNaN(radiusLow) &&
    !isNaN(radiusHigh) &&
    radiusLow <= radiusHigh &&
    radiusLow >= THEMATIC_RADIUS_MIN &&
    radiusHigh <= THEMATIC_RADIUS_MAX;

const errorStyle = {
    width: '100%',
    color: 'red',
    paddingLeft: 8,
    fontSize: 14,
};

const RadiusSelect = ({
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH,
    setRadiusLow,
    setRadiusHigh,
    style,
}) => (
    <Fragment>
        <TextField
            id="lowsize"
            type="number"
            label={i18n.t('Low radius')}
            value={isNaN(radiusLow) ? '' : radiusLow}
            onChange={setRadiusLow}
            InputProps={{
                inputProps: {
                    min: THEMATIC_RADIUS_MIN,
                    max: isNaN(radiusHigh) ? THEMATIC_RADIUS_MAX : radiusHigh,
                },
            }}
            style={style}
        />
        <TextField
            id="highsize"
            type="number"
            label={i18n.t('High radius')}
            value={isNaN(radiusHigh) ? '' : radiusHigh}
            onChange={setRadiusHigh}
            InputProps={{
                inputProps: {
                    min: isNaN(radiusLow) ? THEMATIC_RADIUS_LOW : radiusLow,
                    max: THEMATIC_RADIUS_MAX,
                },
            }}
            style={style}
        />
        {!isValidRadius(radiusLow, radiusHigh) && (
            <div style={errorStyle}>
                {i18n.t('Radius should be between {{min}} and {{max}}', {
                    min: THEMATIC_RADIUS_MIN,
                    max: THEMATIC_RADIUS_MAX,
                })}
            </div>
        )}
    </Fragment>
);

RadiusSelect.propTypes = {
    radiusLow: PropTypes.number,
    radiusHigh: PropTypes.number,
    setRadiusLow: PropTypes.func.isRequired,
    setRadiusHigh: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default connect(
    ({ layerEdit }) => ({
        radiusLow: layerEdit.radiusLow,
        radiusHigh: layerEdit.radiusHigh,
    }),
    { setRadiusLow, setRadiusHigh }
)(RadiusSelect);
