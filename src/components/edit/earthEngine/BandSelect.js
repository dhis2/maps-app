import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import { setBand } from '../../../actions/layerEdit';

export const MAX_BANDS = 10;

const BandSelect = ({ band = [], bands, setBand, errorText }) => {
    let error;

    if (band.length > MAX_BANDS) {
        error = i18n.t('Maximum number of groups are {{maxBands}}', {
            maxBands: MAX_BANDS,
        });
    } else if (errorText && !band.length) {
        error = errorText;
    }

    return (
        <SelectField
            label={i18n.t('Groups')}
            items={bands}
            multiple={true}
            value={band}
            onChange={setBand}
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
