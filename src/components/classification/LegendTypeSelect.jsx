import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setClassification } from '../../actions/layerEdit.js'
import {
    getLegendTypes,
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
} from '../../constants/layers.js'
import { Radio, RadioGroup } from '../core/index.js'

// Select between user defined (automatic), predefined or single color
const LegendTypeSelect = ({ mapType, method, setClassification }) =>
    method ? (
        <RadioGroup
            value={
                method === CLASSIFICATION_EQUAL_COUNTS
                    ? CLASSIFICATION_EQUAL_INTERVALS
                    : method
            }
            onChange={(method) => setClassification(Number(method))}
        >
            {getLegendTypes(mapType === 'BUBBLE').map(({ id, name }) => (
                <Radio key={id} value={id} label={name} />
            ))}
        </RadioGroup>
    ) : null

LegendTypeSelect.propTypes = {
    setClassification: PropTypes.func.isRequired,
    mapType: PropTypes.string,
    method: PropTypes.number,
}

export default connect(null, { setClassification })(LegendTypeSelect)
