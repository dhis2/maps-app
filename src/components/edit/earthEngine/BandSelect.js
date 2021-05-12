import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { connect } from 'react-redux';
import { SelectField } from '../../core';
import { setBand } from '../../../actions/layerEdit';

const BandSelect = ({ band = [], bands, setBand, errorText }) => (
    <SelectField
        label={i18n.t('Groups')}
        items={bands}
        multiple={true}
        value={band}
        onChange={setBand}
        errorText={!band.length && errorText ? errorText : null}
    />
);

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
