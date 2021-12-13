import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import { setBand } from '../../../actions/layerEdit';

const MAX_BANDS = 10;

const BandSelect = ({ band = [], bands, setBand, errorText }) => {
    let warning;

    if (band.length > MAX_BANDS) {
        warning = i18n.t(
            'Choosing many groups takes a long time to calculate and display.'
        );
    }

    return (
        <SelectField
            label={i18n.t('Groups')}
            items={bands}
            multiple={true}
            value={band}
            onChange={setBand}
            warning={warning}
            errorText={errorText}
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
