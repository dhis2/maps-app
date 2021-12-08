import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import { setBand } from '../../../actions/layerEdit';

const MAX_BANDS = 10;

const BandSelect = ({ band = [], bands, setBand, errorText }) => {
    const [hasMaxBands, setHasMaxBands] = useState(band.length > MAX_BANDS);

    const onBandChange = useCallback(band => {
        if (band.length > MAX_BANDS) {
            setHasMaxBands(true);
        } else {
            setBand(band);
            setHasMaxBands(false);
        }
    }, []);

    const error = hasMaxBands
        ? i18n.t('Maximum number of groups are {{MAX_BANDS}}', { MAX_BANDS })
        : !band.length && errorText
        ? errorText
        : null;

    return (
        <SelectField
            label={i18n.t('Groups')}
            items={bands}
            multiple={true}
            value={band}
            onChange={onBandChange}
            errorText={error}
        />
    );
};

BandSelect.propTypes = {
    band: PropTypes.array,
    bands: PropTypes.array.isRequired,
    setBand: PropTypes.func.isRequired,
    errorText: PropTypes.string,
};

export default connect(
    ({ layerEdit }) => ({
        band: layerEdit.band,
        bands: layerEdit.bands,
    }),
    { setBand }
)(BandSelect);
