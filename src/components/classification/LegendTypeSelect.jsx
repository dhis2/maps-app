import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { setClassification } from '../../actions/layerEdit.js'
import {
    getLegendTypes,
    getClassificationTypes,
} from '../../constants/layers.js'
import { Radio, RadioGroup } from '../core/index.js'

const CLASSIFICATION_AUTO = 2

// Select between user defined (automatic), predefined or single color
const LegendTypeSelect = ({ mapType, method, setClassification }) =>
    method ? (
        <RadioGroup
            value={
                getClassificationTypes()
                    .map(({ id }) => id)
                    .includes(method)
                    ? CLASSIFICATION_AUTO
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
