import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setBand } from '../../../actions/layerEdit.js'
import { SelectField } from '../../core/index.js'

const BandSelect = ({ band = [], bands, setBand, errorText }) => (
    <SelectField
        label={i18n.t('Groups')}
        items={bands}
        multiple={true}
        value={band}
        onChange={setBand}
        errorText={errorText}
    />
)

BandSelect.propTypes = {
    bands: PropTypes.array.isRequired,
    setBand: PropTypes.func.isRequired,
    band: PropTypes.array,
    errorText: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        band: layerEdit.band,
        bands: layerEdit.bands,
    }),
    { setBand }
)(BandSelect)
