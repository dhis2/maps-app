import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setBand } from '../../../actions/layerEdit.js'
import { SelectField } from '../../core/index.js'

const DEFAULT_NO_BAND = []

const BandSelect = ({ band, bands, setBand, errorText }) => {
    const value = band ?? bands.default ?? DEFAULT_NO_BAND
    return (
        <SelectField
            label={bands.label}
            items={bands.list}
            multiple={bands.multiple}
            value={value}
            onChange={setBand}
            errorText={errorText}
        />
    )
}

BandSelect.propTypes = {
    bands: PropTypes.object.isRequired,
    setBand: PropTypes.func.isRequired,
    band: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    errorText: PropTypes.string,
}

export default connect(
    ({ layerEdit }) => ({
        band: layerEdit.band,
        bands: layerEdit.bands,
    }),
    { setBand }
)(BandSelect)
