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

const RadiusSelect = ({
    radiusLow = THEMATIC_RADIUS_LOW,
    radiusHigh = THEMATIC_RADIUS_HIGH,
    setRadiusLow,
    setRadiusHigh,
    style,
}) => {
    return (
        <Fragment>
            <TextField
                id="lowsize"
                type="number"
                label={i18n.t('Low radius')}
                value={radiusLow}
                onChange={radius => setRadiusLow(radius)}
                InputProps={{
                    inputProps: {
                        min: THEMATIC_RADIUS_MIN,
                        max: radiusHigh,
                    },
                }}
                style={{
                    ...style,
                    maxWidth: 140,
                }}
            />
            <TextField
                id="highsize"
                type="number"
                label={i18n.t('High radius')}
                value={radiusHigh}
                onChange={radius => setRadiusHigh(radius)}
                InputProps={{
                    inputProps: {
                        min: radiusLow,
                        max: THEMATIC_RADIUS_MAX,
                    },
                }}
                style={{
                    ...style,
                    maxWidth: 140,
                }}
            />
        </Fragment>
    );
};

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
